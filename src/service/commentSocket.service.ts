import { Socket, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import LiveComment from '@/models/LiveComment';
import { LiveCommentForm } from '@/types';
import broadcast from '@/models/broadcast';

interface Comment {
  roomID: string;
  comment: any;
}

const commentsByMovie: Record<string, any[]> = {};

export async function handleCommentEvents(
  io: Server,
  socket: Socket
): Promise<void> {
  socket.on('joinRoom', async (roomID: string) => {
    socket.join(roomID);

    const initialComments = await LiveComment.aggregate([
      {
        $match: {
          broadcast_id: roomID
        }
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'user_id',
          foreignField: 'id',
          as: 'author'
        }
      },
      {
        $unwind: '$author'
      },
      {
        $project: {
          id: 1,
          content: 1,
          timestamp: 1,
          'author.username': 1,
          'author.avatar': 1,
          'author.full_name': 1
        }
      }
    ]);

    // const initialComments = commentsByMovie[roomID] || [];

    socket.emit('initialComments', initialComments);
  });

  socket.on('leaveRoom', async (roomID: string) => {
    socket.leave(roomID);
  });

  socket.on('getStatus', async (roomID: string) => {
    let roomClients = io.sockets.adapter.rooms.get(roomID);
    const isJoined = roomClients?.has(socket.id) ?? false;
    if (!isJoined) {
      socket.join(roomID);

      roomClients = io.sockets.adapter.rooms.get(roomID);
    }

    const clientCount = roomClients ? roomClients.size : 0;

    io.to(roomID).emit('getStatus', { clientCount });
  });

  //   socket.on('newComment', async ({ roomID, comment }: Comment) => {
  socket.on('newComment', async (comment: LiveCommentForm) => {
    // if (!commentsByMovie[roomID]) {
    //   commentsByMovie[roomID] = [];
    // }

    const roomID = comment.broadcast_id;

    const idComment: string = uuidv4();

    const result = await LiveComment.create({
      id: idComment,
      user_id: comment.user_id,
      broadcast_id: comment.broadcast_id,
      movie_id: comment.movie_id,
      content: comment.content,
      timestamp: comment.timestamp,
      parent_id: '',
      reply_to: '',
      type: 'parent',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const resultWithAuthor = await LiveComment.aggregate([
      {
        $match: { _id: result._id }
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'user_id',
          foreignField: 'id',
          as: 'author'
        }
      },
      {
        $unwind: '$author'
      },
      {
        $project: {
          _id: 1,
          user_id: 1,
          broadcast_id: 1,
          movie_id: 1,
          content: 1,
          timestamp: 1,
          parent_id: 1,
          reply_to: 1,
          type: 1,
          created_at: 1,
          updated_at: 1,
          author: {
            id: 1,
            username: 1,
            avatar: 1,
            full_name: 1
          }
        }
      }
    ]);

    // commentsByMovie[roomID].push(comment);

    io.to(roomID).emit('newComment', resultWithAuthor[0]);
  });

  socket.on('interactEmoji', async ({ roomID, emoji_type }) => {
    if (!roomID) return;

    await broadcast.updateOne(
      { id: roomID },
      {
        $inc: { number_of_interactions: 1 }
      }
    );

    io.to(roomID).emit('interactEmoji', { emoji_type });
  });
}
