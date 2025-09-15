import React from "react";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  VideoCameraIcon,
  BookOpenIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const TutorSchedulePage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Schedule & Lesson Management
          </h1>
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              View Calendar
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Schedule Lesson
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "This Week",
              value: "12 lessons",
              icon: CalendarIcon,
              color: "blue",
            },
            {
              label: "Pending Requests",
              value: "3 requests",
              icon: ClockIcon,
              color: "yellow",
            },
            {
              label: "Active Students",
              value: "24 students",
              icon: UserGroupIcon,
              color: "green",
            },
            {
              label: "Completion Rate",
              value: "98%",
              icon: ChartBarIcon,
              color: "primary",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg bg-${
                    stat.color === "primary" ? "primary" : stat.color
                  }-100`}
                >
                  <stat.icon
                    className={`w-5 h-5 text-${
                      stat.color === "primary" ? "primary" : stat.color
                    }-600`}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Schedule Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Lessons */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Lessons
          </h3>
          <div className="space-y-4">
            {[
              {
                student: "Sarah Johnson",
                subject: "Mathematics",
                time: "Today, 3:00 PM",
                duration: "60 min",
              },
              {
                student: "Mike Chen",
                subject: "Physics",
                time: "Tomorrow, 4:30 PM",
                duration: "90 min",
              },
              {
                student: "Emma Davis",
                subject: "Calculus",
                time: "Wed, 2:00 PM",
                duration: "60 min",
              },
            ].map((lesson, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <BookOpenIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {lesson.student}
                      </p>
                      <p className="text-sm text-gray-600">
                        {lesson.subject} • {lesson.duration}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {lesson.time}
                    </p>
                    <button className="text-xs text-primary hover:underline">
                      Join Call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Booking Requests
          </h3>
          <div className="space-y-4">
            {[
              {
                student: "Alex Wilson",
                subject: "Algebra",
                time: "Fri, 5:00 PM",
                status: "pending",
              },
              {
                student: "Lisa Brown",
                subject: "Geometry",
                time: "Sat, 10:00 AM",
                status: "new",
              },
              {
                student: "David Lee",
                subject: "Physics",
                time: "Mon, 3:30 PM",
                status: "pending",
              },
            ].map((request, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.student}
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.subject} • {request.time}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      request.status === "new"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {request.status === "new" ? "New" : "Pending"}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary/90 transition-colors">
                    Accept
                  </button>
                  <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Feature Placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Calendar View",
            desc: "Visual calendar with drag-and-drop scheduling",
            icon: CalendarIcon,
          },
          {
            title: "Availability Settings",
            desc: "Set your working hours and time preferences",
            icon: ClockIcon,
          },
          {
            title: "Lesson History",
            desc: "Complete history of all your teaching sessions",
            icon: BookOpenIcon,
          },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
          >
            <div className="w-12 h-12 bg-accent/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <feature.icon className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">{feature.desc}</p>
            <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
              Coming Soon
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TutorSchedulePage;
