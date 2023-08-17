"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorMsg_1 = __importDefault(require("../utils/errorMsg"));
const mongoose_1 = require("../utils/mongoose");
const mongoose_2 = require("../utils/mongoose");
const discoverHandle_1 = require("../utils/discoverHandle");
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
            switch (req.params.slug) {
                case 'all':
                    if (req.query.hasOwnProperty('sort_by')) {
                        switch (req.query.sort_by) {
                            case 'popularity_desc':
                                (0, discoverHandle_1.getAll)({
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
                                }, {
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
                                }, { popularity: -1 }, { popularity: -1 }, res, req);
                                break;
                            case 'release_date_desc':
                                (0, discoverHandle_1.getAll)({
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
                                }, {
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
                                }, { release_date: -1 }, { first_air_date: -1 }, res, req);
                                break;
                            case 'revenue_desc':
                                (0, discoverHandle_1.getAll)({
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
                                }, {
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
                                }, { revenue: -1 }, {}, res, req);
                                break;
                            case 'vote_average_desc':
                                (0, discoverHandle_1.getAll)({
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
                                }, {
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
                                }, { vote_count: -1, vote_average: -1 }, { vote_count: -1, vote_average: -1 }, res, req);
                                break;
                            case 'vote_count_desc':
                                (0, discoverHandle_1.getAll)({
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
                                }, {
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
                                }, { vote_count: -1 }, { vote_count: -1 }, res, req);
                                break;
                            default:
                                (0, discoverHandle_1.getAll)({
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
                                }, {
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
                                }, {}, {}, res, req);
                                break;
                        }
                    }
                    else {
                        (0, discoverHandle_1.getAll)({
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
                        }, {
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
                        }, {}, {}, res, req);
                    }
                    break;
                case 'movie':
                    if (req.query.hasOwnProperty('sort_by')) {
                        switch (req.query.sort_by) {
                            case 'popularity_desc':
                                (0, discoverHandle_1.getMovie)({
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
                                }, { popularity: -1 }, res, req);
                                break;
                            case 'release_date_desc':
                                (0, discoverHandle_1.getMovie)({
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
                                }, { release_date: -1 }, res, req);
                                break;
                            case 'revenue_desc':
                                (0, discoverHandle_1.getMovie)({
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
                                }, { revenue: -1 }, res, req);
                                break;
                            case 'vote_average_desc':
                                (0, discoverHandle_1.getMovie)({
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
                                }, { vote_count: -1, vote_average: -1 }, res, req);
                                break;
                            case 'vote_count_desc':
                                (0, discoverHandle_1.getMovie)({
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
                                }, { vote_count: -1 }, res, req);
                                break;
                            default:
                                (0, discoverHandle_1.getMovie)({
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
                                }, {}, res, req);
                                break;
                        }
                    }
                    else {
                        (0, discoverHandle_1.getMovie)({
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
                        }, {}, res, req);
                    }
                    break;
                case 'tv':
                    if (req.query.hasOwnProperty('sort_by')) {
                        switch (req.query.sort_by) {
                            case 'popularity_desc':
                                (0, discoverHandle_1.getTV)({
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
                                }, { popularity: -1 }, res, req);
                                break;
                            case 'release_date_desc':
                                (0, discoverHandle_1.getTV)({
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
                                }, { first_air_date: -1 }, res, req);
                                break;
                            case 'revenue_desc':
                                (0, discoverHandle_1.getTV)({
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
                                }, {}, res, req);
                                break;
                            case 'vote_average_desc':
                                (0, discoverHandle_1.getTV)({
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
                                }, { vote_count: -1, vote_average: -1 }, res, req);
                                break;
                            case 'vote_count_desc':
                                (0, discoverHandle_1.getTV)({
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
                                }, { vote_count: -1 }, res, req);
                                break;
                            default:
                                (0, discoverHandle_1.getTV)({
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
                                }, {}, res, req);
                                break;
                        }
                    }
                    else {
                        (0, discoverHandle_1.getTV)({
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
                        }, {}, res, req);
                    }
                    break;
                default:
                    res.status(400).json(errorMsg_1.default.errDefault);
                    break;
            }
        }
        catch (error) {
            res.status(400).json(errorMsg_1.default.errDefault);
        }
        finally {
        }
    }
}
exports.default = new DiscoverController();
//# sourceMappingURL=DiscoverController.js.map