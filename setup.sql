CREATE DATABASE IF NOT EXISTS `thefifthworld` DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;
USE `thefifthworld`;


SET @PREVIOUS_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;


CREATE TABLE `authorizations` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `member` int(11) unsigned NOT NULL,
  `provider` varchar(15) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `oauth2_id` varchar(255) DEFAULT NULL,
  `oauth2_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `authMember` (`member`),
  CONSTRAINT `authMember` FOREIGN KEY (`member`) REFERENCES `members` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;


CREATE TABLE `changes` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `page` int(11) unsigned NOT NULL DEFAULT '0',
  `editor` int(10) unsigned NOT NULL DEFAULT '0',
  `timestamp` int(32) unsigned NOT NULL DEFAULT '0',
  `msg` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `json` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `changeEditor` (`editor`),
  KEY `changePage` (`page`),
  CONSTRAINT `changeEditor` FOREIGN KEY (`editor`) REFERENCES `members` (`id`),
  CONSTRAINT `changePage` FOREIGN KEY (`page`) REFERENCES `pages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=277 DEFAULT CHARSET=utf8;


CREATE TABLE `communities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `data` longtext CHARACTER SET utf8 COLLATE utf8_general_ci,
  `complete` tinyint(1) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8;


CREATE TABLE `files` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `thumbnail` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `mime` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `size` int(128) unsigned DEFAULT '0',
  `page` int(11) unsigned DEFAULT '0',
  `timestamp` int(32) unsigned DEFAULT '0',
  `uploader` int(11) unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `filePage` (`page`),
  CONSTRAINT `filePage` FOREIGN KEY (`page`) REFERENCES `pages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;


CREATE TABLE `members` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` char(60) DEFAULT NULL,
  `bio` longtext CHARACTER SET utf8 COLLATE utf8_general_ci,
  `facebook` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `twitter` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `github` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `patreon` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `web` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `active` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `admin` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `invitations` int(11) unsigned NOT NULL DEFAULT '5',
  `reset` int(1) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1004 DEFAULT CHARSET=utf8;


CREATE TABLE `invitations` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `inviteFrom` int(11) unsigned NOT NULL,
  `inviteTo` int(11) unsigned NOT NULL,
  `inviteCode` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `accepted` tinyint(1) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `inviteTo` (`inviteTo`),
  KEY `inviteFrom` (`inviteFrom`),
  CONSTRAINT `inviteFrom` FOREIGN KEY (`inviteFrom`) REFERENCES `members` (`id`),
  CONSTRAINT `inviteTo` FOREIGN KEY (`inviteTo`) REFERENCES `members` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=998 DEFAULT CHARSET=utf8;


CREATE TABLE `likes` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `path` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `page` int(11) unsigned NOT NULL DEFAULT '0',
  `member` int(11) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `likePage` (`page`),
  KEY `likeMember` (`member`),
  CONSTRAINT `likeMember` FOREIGN KEY (`member`) REFERENCES `members` (`id`),
  CONSTRAINT `likePage` FOREIGN KEY (`page`) REFERENCES `pages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8;


CREATE TABLE `messages` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `member` int(10) unsigned NOT NULL DEFAULT '0',
  `type` enum('warning','error','info','confirmation') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'info',
  `message` varchar(512) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `messageMember` (`member`),
  CONSTRAINT `messageMember` FOREIGN KEY (`member`) REFERENCES `members` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;


CREATE TABLE `pages` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `description` varchar(240) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'Four hundred years from now, humanity thrives beyond civilization.',
  `image` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `header` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `slug` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `path` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `parent` int(11) unsigned DEFAULT '0',
  `type` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `permissions` smallint(5) unsigned NOT NULL DEFAULT '777',
  `owner` int(11) unsigned DEFAULT '0',
  `depth` tinyint(3) unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `path` (`path`),
  KEY `pageOwner` (`owner`),
  CONSTRAINT `pageOwner` FOREIGN KEY (`owner`) REFERENCES `members` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=165 DEFAULT CHARSET=utf8;


CREATE TABLE `names` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(256) NOT NULL DEFAULT '0',
  `knower` varchar(256) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `nameKnown` (`name`),
  KEY `nameKnower` (`knower`),
  CONSTRAINT `nameKnower` FOREIGN KEY (`knower`) REFERENCES `pages` (`path`),
  CONSTRAINT `nameKnown` FOREIGN KEY (`name`) REFERENCES `pages` (`path`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;


CREATE TABLE `places` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `page` int(11) unsigned NOT NULL DEFAULT '0',
  `location` point NOT NULL /*!80003 SRID 4326 */,
  PRIMARY KEY (`id`),
  SPATIAL KEY `location` (`location`),
  KEY `placePage` (`page`),
  CONSTRAINT `placePage` FOREIGN KEY (`page`) REFERENCES `pages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;


CREATE TABLE `responses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `form` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `data` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;


CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `tags` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `page` int(11) unsigned DEFAULT '0',
  `tag` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `value` varchar(240) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tagPage` (`page`),
  CONSTRAINT `tagPage` FOREIGN KEY (`page`) REFERENCES `pages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;


SET FOREIGN_KEY_CHECKS = @PREVIOUS_FOREIGN_KEY_CHECKS;
