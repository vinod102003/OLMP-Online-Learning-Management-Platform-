import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import React from "react";
import { Link } from "react-router-dom";

const Course = ({ course }) => {
  return (
    <Link to={`/course-detail/${course._id}`}>
      <Card className="overflow-hidden rounded-lg bg-card text-card-foreground shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 p-0 h-full">
        <div className="w-full relative">
          <img
            src={course.courseThumbnail || 'https://placehold.co/600x400?text=Course+Thumbnail'}
            alt={course.courseTitle}
            className="w-full h-36 object-cover"
          />
          {course.isPublished && (
            <Badge className="absolute top-2 right-2 bg-green-600 text-white">
              Published
            </Badge>
          )}
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <h1 className="hover:underline font-bold text-lg line-clamp-2 min-h-[3.5rem]">
              {course.courseTitle}
            </h1>
            {course.subTitle && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {course.subTitle}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    course.creator?.photoUrl || "https://github.com/shadcn.png"
                  }
                  alt={course.creator?.name || 'Instructor'}
                />
                <AvatarFallback>{course.creator?.name?.charAt(0) || 'I'}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="font-medium text-sm">{course.creator?.name}</h2>
                <p className="text-xs text-gray-500">{course.category}</p>
              </div>
            </div>
            <Badge
              className={
                `px-2 py-1 text-xs rounded-full ${
                  course.courseLevel === 'Beginner' ? 'bg-green-600' :
                  course.courseLevel === 'Intermediate' ? 'bg-yellow-600' :
                  'bg-red-600'} text-white`
              }
            >
              {course.courseLevel}
            </Badge>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-lg font-bold">
              <span>₹{course.coursePrice}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{course.lectures?.length || 0} lectures</span>
              <span>•</span>
              <span>{course.enrolledStudents?.length || 0} students</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default Course;
