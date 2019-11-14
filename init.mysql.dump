SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE IF NOT EXISTS `projects` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `info` text NOT NULL,
  `modules` text NOT NULL,
  `version` varchar(20) NOT NULL DEFAULT '0.1.0',
  `author_id` bigint(20) NOT NULL DEFAULT '0',
  `type` enum('open','shared','private','editing','old','trash') NOT NULL DEFAULT 'editing',
  `authors` text NOT NULL,
  `genre` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  `gametype` varchar(255) NOT NULL,
  `difficulty` varchar(255) NOT NULL,
  `lengthinfo` varchar(255) NOT NULL,
  `hashid` bigint(20) NOT NULL,
  `hashlink` varchar(64) NOT NULL,
  `hashurl` varchar(64) NOT NULL,
  `release_id` bigint(20) NOT NULL,
  `create_date` date NOT NULL,
  `release_date` date NOT NULL,
  `trash` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `hashid` (`hashid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=74 ;

CREATE TABLE IF NOT EXISTS `project_objects` (
  `project_id` bigint(20) NOT NULL,
  `object_id` varchar(36) NOT NULL,
  `object_name` varchar(255) NOT NULL,
  `object_json` longtext NOT NULL,
  PRIMARY KEY (`project_id`,`object_id`),
  KEY `object_name` (`object_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type` enum('active','closed') NOT NULL DEFAULT 'active',
  `project_id` bigint(20) NOT NULL,
  `hashid` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `session_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `project_id` bigint(20) NOT NULL,
  `session_hashid` varchar(255) NOT NULL,
  `type` enum('gps','error','console','load') NOT NULL,
  `data` longtext NOT NULL,
  PRIMARY KEY (`id`),
  KEY `datetime` (`datetime`),
  KEY `project_id` (`project_id`,`session_hashid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=23424 ;

CREATE TABLE IF NOT EXISTS `session_store` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(32) NOT NULL,
  `project_id` bigint(20) NOT NULL,
  `json` longblob NOT NULL,
  `create_date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id` (`session_id`),
  KEY `project_id` (`project_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=493 ;

CREATE TABLE IF NOT EXISTS `session_waitplayers` (
  `id` varchar(32) NOT NULL,
  `project_id` bigint(20) NOT NULL,
  `info` text NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `level` float NOT NULL,
  `treasures` int(11) NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `mapicon` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(64) NOT NULL,
  `sessid` varchar(48) NOT NULL,
  `last_login` datetime NOT NULL,
  `flags` set('user','administrator') NOT NULL,
  `active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `email` (`email`),
  KEY `cookie` (`sessid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=89 ;

CREATE TABLE IF NOT EXISTS `users_projects` (
  `user_id` bigint(20) NOT NULL,
  `project_id` bigint(20) NOT NULL,
  `access` set('creator','writer','tester') NOT NULL,
  PRIMARY KEY (`user_id`,`project_id`),
  KEY `project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `users_session` (
  `session_id` varchar(32) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `project_id` bigint(20) NOT NULL,
  KEY `user_id` (`user_id`),
  KEY `project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
