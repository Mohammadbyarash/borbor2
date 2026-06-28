-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 28, 2026 at 07:30 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `borbor`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `schedule_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `status` enum('present','absent','late','leave','expulsion') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `school_id` bigint(20) UNSIGNED NOT NULL,
  `grade_id` bigint(20) UNSIGNED NOT NULL,
  `field_id` bigint(20) UNSIGNED DEFAULT NULL,
  `code` varchar(50) DEFAULT NULL,
  `is_archived` tinyint(1) NOT NULL DEFAULT 0,
  `archived_at` timestamp NULL DEFAULT NULL,
  `archived_reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `school_id`, `grade_id`, `field_id`, `code`, `is_archived`, `archived_at`, `archived_reason`) VALUES
(1, 10, 14, 2, '110', 0, NULL, NULL),
(12, 10, 13, 2, '205', 0, NULL, NULL),
(13, 10, 13, 2, '206', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `exam_events`
--

CREATE TABLE `exam_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `school_id` bigint(20) UNSIGNED NOT NULL,
  `class_id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('midterm','final','quiz','project') NOT NULL DEFAULT 'midterm',
  `date` date NOT NULL,
  `time` time NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fields`
--

CREATE TABLE `fields` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `school_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fields`
--

INSERT INTO `fields` (`id`, `school_id`, `title`) VALUES
(1, 10, 'کامپیوتر'),
(2, 10, 'الکترونیک');

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `school_id` bigint(20) UNSIGNED NOT NULL,
  `title` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`id`, `school_id`, `title`) VALUES
(13, 10, 10),
(14, 10, 11),
(15, 10, 12);

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `school_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `unit` tinyint(4) DEFAULT NULL,
  `field_id` bigint(20) UNSIGNED DEFAULT NULL,
  `author` varchar(150) DEFAULT NULL,
  `publisher` varchar(150) DEFAULT NULL,
  `year` char(4) DEFAULT NULL,
  `evaluation` varchar(50) DEFAULT 'امتحان ترم',
  `cover_image` longtext DEFAULT NULL,
  `pdf_file` longtext DEFAULT NULL,
  `topics` text DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`id`, `school_id`, `name`, `code`, `unit`, `field_id`, `author`, `publisher`, `year`, `evaluation`, `cover_image`, `pdf_file`, `topics`, `description`) VALUES
(1, 10, 'تست', 'Ma', 6, 1, 'ممد', 'ممد', '1403', 'امتحان + پروژه', '../uploads/file_6a1be1dbc75669.26146754.jpg', '../uploads/file_69983f98715a49.96950304.pdf', 'تهتهخت', 'هتهخت'),
(2, 10, 'jjsjjj', 'jjj', 6, 2, NULL, NULL, NULL, 'امتحان ترم', NULL, '../uploads/file_6a1be1b3da6227.75438616.pdf', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `licenses`
--

CREATE TABLE `licenses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `school_id` bigint(20) UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `license_plans`
--

CREATE TABLE `license_plans` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(50) DEFAULT NULL,
  `duration_days` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE `logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `school_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `school_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `teacher_access` enum('none','read','write','both') DEFAULT 'none',
  `vice_principal_access` enum('none','read','write','both') DEFAULT 'none',
  `student_access` enum('none','read','write','both') DEFAULT 'none',
  `parent_access` enum('none','read','write','both') DEFAULT 'none',
  `is_locked` tinyint(1) DEFAULT 0,
  `locked_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_owner_only` tinyint(1) DEFAULT 0,
  `page_key` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `school_id`, `name`, `category`, `description`, `teacher_access`, `vice_principal_access`, `student_access`, `parent_access`, `is_locked`, `locked_by`, `created_by`, `created_at`, `is_owner_only`, `page_key`) VALUES
(3, 10, 'دسترسی به صفحه داشبورد', 'صفحات', 'مشاهده صفحه داشبورد و آمار کلی', 'read', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, 'dashbord'),
(4, 10, 'دسترسی به صفحه مدیریت معاونان', 'صفحات', 'مشاهده صفحه مدیریت معاونان', 'none', 'none', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, 'Assistant_management'),
(5, 10, 'دسترسی به صفحه مدیریت معلمین', 'صفحات', 'مشاهده صفحه مدیریت معلمین', 'none', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, 'Teacher_management'),
(6, 10, 'دسترسی به صفحه مدیریت دانش‌آموزان', 'صفحات', 'مشاهده صفحه مدیریت دانش‌آموزان', 'none', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, 'student'),
(7, 10, 'دسترسی به صفحه مدیریت اولیاء', 'صفحات', 'مشاهده صفحه مدیریت اولیاء', 'none', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, 'Parents'),
(8, 10, 'دسترسی به صفحه مدیریت دروس', 'صفحات', 'مشاهده صفحه مدیریت دروس', 'none', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, 'Courses'),
(9, 10, 'دسترسی به صفحه برنامه کلاسی', 'صفحات', 'مشاهده صفحه برنامه کلاسی', 'read', 'read', 'read', 'read', 0, NULL, 10, '2026-02-20 20:42:21', 0, 'Class-schedule'),
(10, 10, 'دسترسی به صفحه حضور و غیاب', 'صفحات', 'مشاهده صفحه حضور و غیاب', 'read', 'read', 'read', 'read', 0, NULL, 10, '2026-02-20 20:42:21', 0, 'Attendance'),
(11, 10, 'دسترسی به صفحه نمرات', 'صفحات', 'مشاهده صفحه نمرات', 'read', 'read', 'read', 'read', 0, NULL, 10, '2026-02-20 20:42:21', 0, 'grades'),
(12, 10, 'دسترسی به صفحه پیش‌ثبت‌نام', 'صفحات', 'مشاهده صفحه پیش‌ثبت‌نام', 'none', 'none', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, 'Pre-registration'),
(13, 10, 'دسترسی به صفحه گزارش‌ها', 'صفحات', 'مشاهده صفحه گزارش‌ها', 'read', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, 'reports'),
(14, 10, 'دسترسی به صفحه اطلاعیه‌ها', 'صفحات', 'مشاهده صفحه اطلاعیه‌ها', 'read', 'read', 'read', 'read', 0, NULL, 10, '2026-02-20 20:42:21', 0, 'notife'),
(15, 10, 'دسترسی به صفحه آرشیو', 'صفحات', 'مشاهده صفحه آرشیو', 'none', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, 'archive'),
(16, 10, 'دسترسی به صفحه تنظیمات', 'صفحات', 'مشاهده صفحه تنظیمات', 'none', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, 'settings'),
(17, 10, 'دسترسی به صفحه پروفایل معلم', 'صفحات', 'مشاهده پروفایل کامل معلم', 'read', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, 'teacher-profile'),
(18, 10, 'دسترسی به صفحه مدیریت دسترسی‌ها', 'صفحات', 'مشاهده صفحه مدیریت دسترسی‌ها', 'none', 'none', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 1, 'permissions'),
(19, 10, 'دسترسی به صفحه کاربران', 'صفحات', 'مشاهده صفحه همه کاربران سیستم', 'none', 'read', 'none', 'none', 1, 15, 10, '2026-02-20 20:42:21', 1, 'users'),
(20, 10, 'مشاهده معاونین', 'مدیریت معاونین', 'مشاهده لیست معاونین', 'none', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, NULL),
(24, 10, 'مشاهده معلمین', 'مدیریت معلمین', 'مشاهده لیست معلمین', 'read', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, NULL),
(28, 10, 'مشاهده دانش‌آموزان', 'مدیریت دانش‌آموزان', 'مشاهده لیست دانش‌آموزان', 'read', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, NULL),
(32, 10, 'مشاهده اولیاء', 'مدیریت اولیاء', 'مشاهده لیست اولیاء', 'read', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, NULL),
(36, 10, 'مشاهده دروس', 'مدیریت دروس', 'مشاهده لیست دروس', 'read', 'read', 'read', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, NULL),
(40, 10, 'مشاهده برنامه کلاسی', 'برنامه کلاسی', 'مشاهده جدول زمانی کلاس‌ها', 'read', 'read', 'read', 'read', 0, NULL, 10, '2026-02-20 20:42:21', 0, NULL),
(42, 10, 'مشاهده حضور و غیاب', 'حضور و غیاب', 'مشاهده وضعیت حضور دانش‌آموزان', 'read', 'read', 'read', 'read', 0, NULL, 10, '2026-02-20 20:42:21', 0, NULL),
(45, 10, 'مشاهده نمرات', 'مدیریت نمرات', 'مشاهده نمرات دانش‌آموزان', 'read', 'read', 'read', 'read', 0, NULL, 10, '2026-02-20 20:42:21', 0, NULL),
(49, 10, 'مشاهده پیش‌ثبت‌نام', 'پیش‌ثبت‌نام', 'مشاهده درخواست‌های پیش‌ثبت‌نام', 'none', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, NULL),
(51, 10, 'مشاهده گزارشات', 'گزارشات', 'مشاهده گزارش‌های آماری', 'read', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 0, NULL),
(53, 10, 'مشاهده اطلاعیه‌ها', 'اطلاعیه‌ها', 'مشاهده اطلاعیه‌های مدرسه', 'read', 'read', 'read', 'read', 0, NULL, 10, '2026-02-20 20:42:21', 0, NULL),
(56, 10, 'مشاهده آرشیو', 'آرشیو', 'مشاهده اطلاعات آرشیوشده', 'none', 'read', 'none', 'write', 0, NULL, 10, '2026-02-20 20:42:21', 0, NULL),
(58, 10, 'مشاهده تنظیمات', 'تنظیمات', 'مشاهده تنظیمات مدرسه', 'read', 'read', 'read', 'read', 0, NULL, 10, '2026-02-20 20:42:21', 0, NULL),
(62, 10, 'تنظیم owner-only', 'مدیریت دسترسی‌ها', 'مخفی کردن دسترسی از غیر owner', 'none', 'none', 'none', 'none', 1, 15, 10, '2026-02-20 20:42:21', 1, NULL),
(63, 10, 'مشاهده همه کاربران', 'مدیریت کاربران', 'مشاهده لیست کامل کاربران', 'none', 'none', 'none', 'none', 0, NULL, 10, '2026-02-20 20:42:21', 1, NULL),
(69, 10, 'ویرایش معاون', 'مدیریت معاونین', 'ویرایش اطلاعات معاون', 'none', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(73, 10, 'ویرایش معلم', 'مدیریت معلمین', 'ویرایش اطلاعات معلم', 'none', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(77, 10, 'ویرایش دانش‌آموز', 'مدیریت دانش‌آموزان', 'ویرایش اطلاعات دانش‌آموز', 'none', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(81, 10, 'ویرایش ولی', 'مدیریت اولیاء', 'ویرایش اطلاعات ولی', 'none', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(85, 10, 'ویرایش درس', 'مدیریت دروس', 'ویرایش اطلاعات درس', 'none', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(88, 10, 'ویرایش برنامه کلاسی', 'برنامه کلاسی', 'ویرایش جدول زمانی', 'none', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(90, 10, 'ثبت حضور و غیاب', 'حضور و غیاب', 'ثبت وضعیت حضور دانش‌آموزان', 'write', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(91, 10, 'ویرایش حضور و غیاب', 'حضور و غیاب', 'ویرایش رکورد حضور ثبت‌شده', 'none', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(93, 10, 'ثبت نمره', 'مدیریت نمرات', 'ثبت نمره برای دانش‌آموز', 'write', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(94, 10, 'ویرایش نمره', 'مدیریت نمرات', 'ویرایش نمره ثبت‌شده', 'none', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(97, 10, 'تأیید/رد پیش‌ثبت‌نام', 'پیش‌ثبت‌نام', 'تأیید یا رد درخواست پیش‌ثبت‌نام', 'none', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(99, 10, 'خروجی گزارش (Excel/PDF)', 'گزارشات', 'دانلود گزارش‌ها', 'none', 'read', 'none', 'none', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(101, 10, 'ارسال اطلاعیه', 'اطلاعیه‌ها', 'ارسال اطلاعیه جدید', 'write', 'write', 'none', 'read', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(102, 10, 'حذف اطلاعیه', 'اطلاعیه‌ها', 'حذف اطلاعیه ارسال‌شده', 'none', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(104, 10, 'آرشیو کردن اطلاعات', 'آرشیو', 'انتقال اطلاعات به آرشیو', 'none', 'both', 'none', 'none', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(106, 10, 'ویرایش تنظیمات مدرسه', 'تنظیمات', 'تغییر تنظیمات مدرسه', 'none', 'none', 'none', 'none', 0, NULL, 10, '2026-02-20 23:27:40', 0, NULL),
(109, 10, 'ویرایش دسترسی‌ها', 'مدیریت دسترسی‌ها', 'تغییر سطح دسترسی نقش‌ها', 'none', 'none', 'none', 'none', 1, NULL, 10, '2026-02-20 23:27:40', 1, NULL),
(110, 10, 'قفل/آزاد کردن دسترسی', 'مدیریت دسترسی‌ها', 'قفل یا آزاد کردن یک دسترسی', 'none', 'none', 'none', 'none', 1, NULL, 10, '2026-02-20 23:27:40', 1, NULL),
(112, 10, 'تغییر نقش کاربر', 'مدیریت کاربران', 'تغییر نقش و دسترسی کاربر', 'none', 'none', 'none', 'none', 1, NULL, 10, '2026-02-20 23:27:40', 1, NULL),
(116, 10, 'افزودن معاون', 'مدیریت معاونین', 'ثبت معاون جدید', 'none', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:32:58', 0, NULL),
(117, 10, 'حذف معاون', 'مدیریت معاونین', 'حذف معاون از سیستم', 'none', 'none', 'none', 'none', 0, NULL, 10, '2026-02-20 23:32:58', 0, NULL),
(119, 10, 'افزودن معلم', 'مدیریت معلمین', 'ثبت معلم جدید', 'none', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:32:58', 0, NULL),
(120, 10, 'حذف معلم', 'مدیریت معلمین', 'حذف معلم از سیستم', 'none', 'none', 'none', 'none', 0, NULL, 10, '2026-02-20 23:32:58', 0, NULL),
(122, 10, 'افزودن دانش‌آموز', 'مدیریت دانش‌آموزان', 'ثبت دانش‌آموز جدید', 'none', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:32:58', 0, NULL),
(123, 10, 'حذف دانش‌آموز', 'مدیریت دانش‌آموزان', 'حذف دانش‌آموز از سیستم', 'none', 'none', 'none', 'none', 0, NULL, 10, '2026-02-20 23:32:58', 0, NULL),
(125, 10, 'افزودن ولی', 'مدیریت اولیاء', 'ثبت ولی جدید', 'none', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:32:58', 0, NULL),
(126, 10, 'حذف ولی', 'مدیریت اولیاء', 'حذف ولی از سیستم', 'none', 'none', 'none', 'none', 0, NULL, 10, '2026-02-20 23:32:58', 0, NULL),
(128, 10, 'افزودن درس', 'مدیریت دروس', 'تعریف درس جدید', 'none', 'write', 'none', 'none', 0, NULL, 10, '2026-02-20 23:32:58', 0, NULL),
(129, 10, 'حذف درس', 'مدیریت دروس', 'حذف درس از سیستم', 'none', 'none', 'none', 'none', 0, NULL, 10, '2026-02-20 23:32:58', 0, NULL),
(133, 10, 'حذف نمره', 'مدیریت نمرات', 'حذف نمره ثبت‌شده', 'none', 'none', 'none', 'none', 0, NULL, 10, '2026-02-20 23:32:58', 0, NULL),
(142, 10, 'حذف کاربر', 'مدیریت کاربران', 'حذف کاربر از سیستم', 'none', 'none', 'none', 'none', 1, NULL, 10, '2026-02-20 23:32:58', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `registration`
--

CREATE TABLE `registration` (
  `id` int(11) NOT NULL,
  `school_id` bigint(20) UNSIGNED DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `national_code` char(10) NOT NULL,
  `grade` varchar(20) NOT NULL,
  `major` varchar(50) NOT NULL,
  `birth_date` varchar(10) NOT NULL,
  `student_phone` char(11) DEFAULT NULL,
  `father_name` varchar(100) NOT NULL,
  `father_last_name` varchar(100) DEFAULT NULL,
  `father_education` varchar(50) NOT NULL,
  `father_birth_date` varchar(10) DEFAULT NULL,
  `father_job` varchar(100) DEFAULT NULL,
  `mother_name` varchar(100) NOT NULL,
  `mother_last_name` varchar(100) DEFAULT NULL,
  `mother_education` varchar(50) NOT NULL,
  `mother_birth_date` varchar(10) DEFAULT NULL,
  `mother_job` varchar(100) DEFAULT NULL,
  `mobile1` char(11) NOT NULL,
  `mobile2` char(11) DEFAULT NULL,
  `mobile3` char(11) NOT NULL,
  `karname_file` varchar(255) DEFAULT NULL,
  `photo_file` varchar(255) DEFAULT NULL,
  `hedayat_file` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `tracking_code` varchar(8) DEFAULT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `is_archived` tinyint(1) NOT NULL DEFAULT 0,
  `archived_at` timestamp NULL DEFAULT NULL,
  `archived_reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `registration`
--

INSERT INTO `registration` (`id`, `school_id`, `first_name`, `last_name`, `national_code`, `grade`, `major`, `birth_date`, `student_phone`, `father_name`, `father_last_name`, `father_education`, `father_birth_date`, `father_job`, `mother_name`, `mother_last_name`, `mother_education`, `mother_birth_date`, `mother_job`, `mobile1`, `mobile2`, `mobile3`, `karname_file`, `photo_file`, `hedayat_file`, `created_at`, `tracking_code`, `status`, `is_archived`, `archived_at`, `archived_reason`) VALUES
(15, 10, 'بیسب', 'لیبلیب', '3861785625', 'eleventh', '2', '1385/05/25', '09182104800', 'لیبل', 'arash', 'karshenas_arshad', '1347/05/08', 'یلبل', 'لبیل', 'یبلیب', 'karshenas_napeyvaeste', '1348/05/21', 'لیبلیب', '09185645456', '', '09184845456', 'karname_ce232f974084e0b0.jpg', 'photo_767b800169726244.jpg', NULL, '2026-06-25 23:33:41', '6575A1C6', 'pending', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `class_lesson_id` bigint(20) UNSIGNED NOT NULL,
  `day_of_week` tinyint(4) NOT NULL,
  `time_start` time DEFAULT NULL,
  `time_end` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schools`
--

CREATE TABLE `schools` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schools`
--

INSERT INTO `schools` (`id`, `name`, `code`, `created_at`) VALUES
(10, 'ببب', '6', '2026-02-19 10:18:30'),
(11, 'نام مدرسه', 'SCHOOL001', '2026-02-20 11:59:42');

-- --------------------------------------------------------

--
-- Table structure for table `school_settings`
--

CREATE TABLE `school_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `school_id` bigint(20) UNSIGNED NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `school_settings`
--

INSERT INTO `school_settings` (`id`, `school_id`, `setting_key`, `setting_value`, `updated_at`) VALUES
(1, 10, 'registration_open', '1', '2026-05-20 13:13:00');

-- --------------------------------------------------------

--
-- Table structure for table `scores`
--

CREATE TABLE `scores` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `units_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED DEFAULT NULL,
  `score` decimal(5,2) NOT NULL DEFAULT 0.00,
  `term` tinyint(1) NOT NULL DEFAULT 1,
  `grade_type` enum('continuous','midterm','final') NOT NULL DEFAULT 'continuous',
  `date` date DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `scores`
--

INSERT INTO `scores` (`id`, `units_id`, `student_id`, `score`, `term`, `grade_type`, `date`, `created_by`) VALUES
(1, 1, 13, 10.00, 2, 'continuous', '1404-12-03', 15),
(2, 1, 13, 10.00, 1, 'continuous', '2025-11-20', 15),
(3, 1, 13, 10.00, 1, 'final', '2025-11-05', 15),
(4, 1, 13, 20.00, 1, 'midterm', '2025-11-05', 15);

-- --------------------------------------------------------

--
-- Table structure for table `score_season`
--

CREATE TABLE `score_season` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `school_id` bigint(20) UNSIGNED NOT NULL,
  `score_season_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_classes`
--

CREATE TABLE `student_classes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `class_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_classes`
--

INSERT INTO `student_classes` (`id`, `student_id`, `class_id`) VALUES
(4, 21, 1),
(5, 24, 1);

-- --------------------------------------------------------

--
-- Table structure for table `themes`
--

CREATE TABLE `themes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `school_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `primary_color` varchar(20) DEFAULT NULL,
  `secondary_color` varchar(20) DEFAULT NULL,
  `font` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `themes`
--

INSERT INTO `themes` (`id`, `school_id`, `name`, `primary_color`, `secondary_color`, `font`, `is_active`) VALUES
(1, 10, 'سبز جنگل', '#2ecc71', '#0a1f0e', 'Vazirmatn', 0),
(2, 10, 'آبی اقیانوسی', '#4a90d9', '#0f1629', 'Vazirmatn', 1),
(3, 10, 'فیروزه‌ای', '#06d6a0', '#042f2e', 'Vazirmatn', 0),
(4, 10, 'شب بنفش', '#c084fc', '#1a0a2e', 'Vazirmatn', 0),
(5, 10, 'صورتی گرم', '#f472b6', '#1f0a14', 'Vazirmatn', 0),
(6, 10, 'غروب آتشین', '#f97316', '#1f0a0a', 'Vazirmatn', 0),
(7, 10, 'طلایی', '#f39c12', '#1a1000', 'Vazirmatn', 0);

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `class_id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `class_id`, `lesson_id`, `teacher_id`) VALUES
(1, 1, 1, 9),
(5, 1, 2, 9);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `school_id` bigint(20) UNSIGNED DEFAULT NULL,
  `role` enum('owner','manager','teacher','assistant','parent','student') NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `national_code` varchar(20) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `birth_date` varchar(10) DEFAULT NULL COMMENT 'تاریخ تولد شمسی (YYYY/MM/DD)',
  `photo` varchar(500) DEFAULT NULL COMMENT 'مسیر عکس پروفایل',
  `password` varchar(255) DEFAULT NULL,
  `is_archived` tinyint(1) NOT NULL DEFAULT 0,
  `archived_at` timestamp NULL DEFAULT NULL,
  `archived_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `school_id`, `role`, `first_name`, `last_name`, `username`, `national_code`, `mobile`, `birth_date`, `photo`, `password`, `is_archived`, `archived_at`, `archived_reason`, `created_at`) VALUES
(9, 10, 'teacher', 'ممد', 'ممدیان', 'mmd3', '3333333333', '09333333333', NULL, NULL, '$2y$10$.qpiF.K3hzWEdacGhI.hY.Ekw/k85BgZ1ggD6zZDW4qYLb68/4qV6', 1, '2026-05-31 09:38:03', 'آرشیو توسط مدیر', '2026-02-20 09:14:03'),
(10, 10, 'owner', 'ممد', 'پورشعبانیان', 'mmdp', NULL, NULL, NULL, NULL, '$2y$10$nGVBt1gXM.qFOo8/W93ZgudBbIKjgf.s/.lbLkV68yyk/U3FZTAaC', 0, NULL, NULL, '2026-02-20 17:38:28'),
(13, 10, 'student', 'iojiojioj', 'oijiojij', '90890809', '3861112233', '09128883344', NULL, 'uploads/students/student_3861112233_1771637063.jpg', '$2y$10$L8moYPOpFiv3gFv0q0uPVehSraVF26X.E47sJTeuqxKLeenRV8sGy', 0, NULL, NULL, '2026-02-21 00:55:06'),
(15, 10, 'owner', 'اکبر', 'اصغری', 'admin', '', '', '1362/05/22', 'uploads/profiles/user_15_1782574829.jpg', '$2y$10$Q6asnGTF7dyomA0/f.nKZ.9jdUvpIjaG.vcOBzXLBIu2DBDmHuhxa', 0, NULL, NULL, '2026-02-21 04:24:33'),
(17, 10, 'student', 'الابل', 'لابا', '3854545454', '3854545454', '09182104800', '3004/12/26', 'uploads/students/student_3854545454_1771791437.jpg', '$2y$10$Kw.mdCoUhDNF0i.eclYfd.VJFw9GKQkL3EuJvcT59KQQAtQHx1Mt.', 0, NULL, NULL, '2026-02-22 20:17:17'),
(20, 10, 'student', 'بیبیب', 'لابا', '4447878787', '4447878787', '09185454545', '3004/10/16', 'uploads/students/student_4447878787_1771793057.jpg', '$2y$10$lCC.B78tL7XFkKhnds08h.u8/QALlb8JTFyn9x1f2TJC83eNMekHy', 0, NULL, NULL, '2026-02-22 20:44:17'),
(21, 10, 'student', '8i787', '87uyuyuy uy', '3777777777', '3777777777', '09666666666', '1405/02/29', NULL, '$2y$10$qkRAovmMb.xaPzmqvjH9/uTUU2j37aR/i7tnFgYtaZ0w1KGEka9MC', 0, NULL, NULL, '2026-02-23 07:53:12'),
(23, 10, 'assistant', 'احمد', '', 'borbor', '0010011102', '09387989677', NULL, NULL, '$2y$10$oiuUHTyZ82.oJEozUPhndurjReHW3q4CImsFW6kYtrOAKxRnhG06i', 0, NULL, NULL, '2026-05-30 17:00:34'),
(24, 10, 'student', 'علی', 'اکبری', '8883710169', '8883710169', '09387989677', '1386/04/18', NULL, '$2y$10$qAsBLVHBZXbp46dAIIdgqOGE4Eiq.FPaby60ZYdtAjfZi2alBj2YC', 0, NULL, NULL, '2026-05-31 07:35:50');

-- --------------------------------------------------------

--
-- Table structure for table `user_permissions`
--

CREATE TABLE `user_permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `grade_id` (`grade_id`),
  ADD KEY `field_id` (`field_id`),
  ADD KEY `idx_classes_is_archived` (`is_archived`);

--
-- Indexes for table `exam_events`
--
ALTER TABLE `exam_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_school` (`school_id`),
  ADD KEY `idx_class` (`class_id`),
  ADD KEY `idx_lesson` (`lesson_id`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_createdby` (`created_by`);

--
-- Indexes for table `fields`
--
ALTER TABLE `fields`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `fk_lessons_field` (`field_id`);

--
-- Indexes for table `licenses`
--
ALTER TABLE `licenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `license_plans`
--
ALTER TABLE `license_plans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_school_name` (`school_id`,`name`(100)),
  ADD UNIQUE KEY `uq_school_page_key` (`school_id`,`page_key`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `idx_page_key` (`page_key`);

--
-- Indexes for table `registration`
--
ALTER TABLE `registration`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_registration_school_id` (`school_id`),
  ADD KEY `idx_is_archived` (`is_archived`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_lesson_id` (`class_lesson_id`);

--
-- Indexes for table `schools`
--
ALTER TABLE `schools`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `school_settings`
--
ALTER TABLE `school_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_school_key` (`school_id`,`setting_key`);

--
-- Indexes for table `scores`
--
ALTER TABLE `scores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_score` (`units_id`,`student_id`,`term`,`grade_type`),
  ADD UNIQUE KEY `unique_score` (`units_id`,`student_id`,`term`,`grade_type`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_unit` (`units_id`);

--
-- Indexes for table `score_season`
--
ALTER TABLE `score_season`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `student_classes`
--
ALTER TABLE `student_classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `themes`
--
ALTER TABLE `themes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `lesson_id` (`lesson_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_username` (`username`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `idx_is_archived` (`is_archived`);

--
-- Indexes for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_permission` (`user_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `exam_events`
--
ALTER TABLE `exam_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fields`
--
ALTER TABLE `fields`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `licenses`
--
ALTER TABLE `licenses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `license_plans`
--
ALTER TABLE `license_plans`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=210;

--
-- AUTO_INCREMENT for table `registration`
--
ALTER TABLE `registration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `schools`
--
ALTER TABLE `schools`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `school_settings`
--
ALTER TABLE `school_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `scores`
--
ALTER TABLE `scores`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `score_season`
--
ALTER TABLE `score_season`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_classes`
--
ALTER TABLE `student_classes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `themes`
--
ALTER TABLE `themes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `user_permissions`
--
ALTER TABLE `user_permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`),
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student_classes` (`student_id`);

--
-- Constraints for table `fields`
--
ALTER TABLE `fields`
  ADD CONSTRAINT `fields_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`);

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`);

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `fk_lessons_field` FOREIGN KEY (`field_id`) REFERENCES `fields` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`);

--
-- Constraints for table `licenses`
--
ALTER TABLE `licenses`
  ADD CONSTRAINT `licenses_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  ADD CONSTRAINT `licenses_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `logs_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `scores`
--
ALTER TABLE `scores`
  ADD CONSTRAINT `scores_ibfk_3` FOREIGN KEY (`units_id`) REFERENCES `units` (`id`);

--
-- Constraints for table `student_classes`
--
ALTER TABLE `student_classes`
  ADD CONSTRAINT `student_classes_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `student_classes_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`);

--
-- Constraints for table `themes`
--
ALTER TABLE `themes`
  ADD CONSTRAINT `themes_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `units`
--
ALTER TABLE `units`
  ADD CONSTRAINT `units_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  ADD CONSTRAINT `units_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  ADD CONSTRAINT `units_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`);

--
-- Constraints for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD CONSTRAINT `user_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
