const DataMovies = require('../models/DataMovies');
const MovieDetail = require('../models/Movie');
const TVdetail = require('../models/TV');
const config = require('../../../package.json');
const API_KEY = config.projectConfig.apiKey;
const errorMsg = require('../../until/errorMsg');
const mongoose = require('mongoose');
const db = require('../../config/db');

const { multipleMongooseToObject } = require('../../until/mongoose');
const { mongooseToObject } = require('../../until/mongoose');
const { getAll, getMovie, getTV } = require('../../until/discoverHandle');

class DiscoverController {
  // GET /

  //   detail(req, res, next) {
  //     if (req.query.api == API_KEY) {

  //     } else {
  //       res.status(400).json(errorMsg.errApiKey);
  //     }
  //   }

  index(req, res, next) {
    try {
      if (req.query.api == API_KEY) {
        switch (req.params.slug) {
          case 'all':
            if (req.query.hasOwnProperty('sort_by')) {
              switch (req.query.sort_by) {
                case 'popularity_desc':
                  getAll(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              release_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              release_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              first_air_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              first_air_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    { popularity: -1 },
                    { popularity: -1 },
                    res,
                    req
                  );
                  break;
                case 'release_date_desc':
                  getAll(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              release_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              release_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              first_air_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              first_air_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    { release_date: -1 },
                    { first_air_date: -1 },
                    res,
                    req
                  );
                  break;
                case 'revenue_desc':
                  getAll(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              release_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              release_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              first_air_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              first_air_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    { revenue: -1 },
                    {},
                    res,
                    req
                  );
                  break;
                case 'vote_average_desc':
                  getAll(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              release_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              release_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              first_air_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              first_air_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    { vote_count: -1, vote_average: -1 },
                    { vote_count: -1, vote_average: -1 },
                    res,
                    req
                  );
                  break;
                case 'vote_count_desc':
                  getAll(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              release_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              release_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              first_air_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              first_air_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    { vote_count: -1 },
                    { vote_count: -1 },
                    res,
                    req
                  );
                  break;
                default:
                  getAll(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              release_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              release_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              first_air_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              first_air_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    {},
                    {},
                    res,
                    req
                  );
                  break;
              }
            } else {
              getAll(
                {
                  $and: [
                    req.query.primary_release_date_gte
                      ? {
                          release_date: {
                            $gte: req.query.primary_release_date_gte,
                            $lt: req.query.primary_release_date_lte,
                          },
                        }
                      : req.query.primary_release_date_lte
                      ? {
                          release_date: {
                            $lt: req.query.primary_release_date_lte,
                          },
                        }
                      : {},
                    req.query.with_genres
                      ? {
                          genres: {
                            $elemMatch: {
                              id: +req.query.with_genres.split(',')[0],
                              name: req.query.with_genres.split(',')[1],
                            },
                          },
                        }
                      : {},
                    req.query.with_original_language
                      ? {
                          original_language: {
                            $regex: req.query.with_original_language,
                          },
                        }
                      : {},
                  ],
                },
                {
                  $and: [
                    req.query.primary_release_date_gte
                      ? {
                          first_air_date: {
                            $gte: req.query.primary_release_date_gte,
                            $lt: req.query.primary_release_date_lte,
                          },
                        }
                      : req.query.primary_release_date_lte
                      ? {
                          first_air_date: {
                            $lt: req.query.primary_release_date_lte,
                          },
                        }
                      : {},
                    req.query.with_genres
                      ? {
                          genres: {
                            $elemMatch: {
                              id: +req.query.with_genres.split(',')[0],
                              name: req.query.with_genres.split(',')[1],
                            },
                          },
                        }
                      : {},
                    req.query.with_original_language
                      ? {
                          original_language: {
                            $regex: req.query.with_original_language,
                          },
                        }
                      : {},
                  ],
                },
                {},
                {},
                res,
                req
              );
            }
            break;
          case 'movie':
            if (req.query.hasOwnProperty('sort_by')) {
              switch (req.query.sort_by) {
                case 'popularity_desc':
                  getMovie(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              release_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              release_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    { popularity: -1 },
                    res,
                    req
                  );
                  break;
                case 'release_date_desc':
                  getMovie(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              release_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              release_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    { release_date: -1 },
                    res,
                    req
                  );
                  break;
                case 'revenue_desc':
                  getMovie(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              release_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              release_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    { revenue: -1 },
                    res,
                    req
                  );
                  break;
                case 'vote_average_desc':
                  getMovie(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              release_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              release_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    { vote_count: -1, vote_average: -1 },
                    res,
                    req
                  );
                  break;
                case 'vote_count_desc':
                  getMovie(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              release_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              release_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    { vote_count: -1 },
                    res,
                    req
                  );
                  break;
                default:
                  getMovie(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              release_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              release_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    {},
                    res,
                    req
                  );
                  break;
              }
            } else {
              getMovie(
                {
                  $and: [
                    req.query.primary_release_date_gte
                      ? {
                          release_date: {
                            $gte: req.query.primary_release_date_gte,
                            $lt: req.query.primary_release_date_lte,
                          },
                        }
                      : req.query.primary_release_date_lte
                      ? {
                          release_date: {
                            $lt: req.query.primary_release_date_lte,
                          },
                        }
                      : {},
                    req.query.with_genres
                      ? {
                          genres: {
                            $elemMatch: {
                              id: +req.query.with_genres.split(',')[0],
                              name: req.query.with_genres.split(',')[1],
                            },
                          },
                        }
                      : {},
                    req.query.with_original_language
                      ? {
                          original_language: {
                            $regex: req.query.with_original_language,
                          },
                        }
                      : {},
                  ],
                },
                {},
                res,
                req
              );
            }
            break;
          case 'tv':
            if (req.query.hasOwnProperty('sort_by')) {
              switch (req.query.sort_by) {
                case 'popularity_desc':
                  getTV(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              first_air_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              first_air_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    { popularity: -1 },
                    res,
                    req
                  );
                  break;
                case 'release_date_desc':
                  getTV(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              first_air_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              first_air_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    { first_air_date: -1 },
                    res,
                    req
                  );
                  break;
                case 'revenue_desc':
                  getTV(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              first_air_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              first_air_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    {},
                    res,
                    req
                  );
                  break;
                case 'vote_average_desc':
                  getTV(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              first_air_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              first_air_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    { vote_count: -1, vote_average: -1 },
                    res,
                    req
                  );
                  break;
                case 'vote_count_desc':
                  getTV(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              first_air_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              first_air_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    { vote_count: -1 },
                    res,
                    req
                  );
                  break;
                default:
                  getTV(
                    {
                      $and: [
                        req.query.primary_release_date_gte
                          ? {
                              first_air_date: {
                                $gte: req.query.primary_release_date_gte,
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : req.query.primary_release_date_lte
                          ? {
                              first_air_date: {
                                $lt: req.query.primary_release_date_lte,
                              },
                            }
                          : {},
                        req.query.with_genres
                          ? {
                              genres: {
                                $elemMatch: {
                                  id: +req.query.with_genres.split(',')[0],
                                  name: req.query.with_genres.split(',')[1],
                                },
                              },
                            }
                          : {},
                        req.query.with_original_language
                          ? {
                              original_language: {
                                $regex: req.query.with_original_language,
                              },
                            }
                          : {},
                      ],
                    },
                    {},
                    res,
                    req
                  );
                  break;
              }
            } else {
              getTV(
                {
                  $and: [
                    req.query.primary_release_date_gte
                      ? {
                          first_air_date: {
                            $gte: req.query.primary_release_date_gte,
                            $lt: req.query.primary_release_date_lte,
                          },
                        }
                      : req.query.primary_release_date_lte
                      ? {
                          first_air_date: {
                            $lt: req.query.primary_release_date_lte,
                          },
                        }
                      : {},
                    req.query.with_genres
                      ? {
                          genres: {
                            $elemMatch: {
                              id: +req.query.with_genres.split(',')[0],
                              name: req.query.with_genres.split(',')[1],
                            },
                          },
                        }
                      : {},
                    req.query.with_original_language
                      ? {
                          original_language: {
                            $regex: req.query.with_original_language,
                          },
                        }
                      : {},
                  ],
                },
                {},
                res,
                req
              );
            }
            break;
          default:
            res.status(400).json(errorMsg.errDefault);
            break;
        }
      } else {
        res.status(400).json(errorMsg.errApiKey);
      }
    } catch (error) {
      res.status(400).json(errorMsg.errDefault);
    } finally {
    }
  }
}

module.exports = new DiscoverController();
