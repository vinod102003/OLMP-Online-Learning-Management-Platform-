import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { BadgeInfo, Lock, PlayCircle } from "lucide-react";
import React from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data, isLoading, isError, error } =
    useGetCourseDetailWithStatusQuery(courseId);

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-gray-500">Loading course details...</p>
      </div>
    </div>
  );
  
  if (isError) {
    const errorMessage = error?.data?.message || error?.message || "Unknown error occurred";
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-red-500 text-xl font-semibold">Error</h1>
          <p className="text-gray-600">Failed to load course details: {errorMessage}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!data?.course) return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-red-500 text-xl font-semibold">Course Not Found</h1>
        <p className="text-gray-600">The course you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    </div>
  );

  const { course, purchased } = data;

  const handleContinueCourse = () => {
    if (purchased) {
      navigate(`/course-progress/${courseId}`);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
      <div className="bg-[#2D2F31] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col gap-2">
          <h1 className="font-bold text-2xl md:text-3xl">
            {course?.courseTitle}
          </h1>
          <p className="text-base md:text-lg">{course?.subTitle}</p>
          <p>
            Created By{" "}
            <span className="text-[#C0C4FC] underline italic">
              {course?.creator?.name}
            </span>
          </p>
          <div className="flex items-center gap-2 text-sm">
            <BadgeInfo size={16} />
            <p>Last updated {course?.createdAt?.split("T")[0]}</p>
          </div>
          <p>Students enrolled: {course?.enrolledStudents?.length || 0}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto my-8 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full lg:w-1/2 space-y-5">
          <h1 className="font-bold text-xl md:text-2xl">Description</h1>
          <p
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: course?.description }}
          />
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>{course?.lectures?.length || 0} lectures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course?.lectures?.map((lecture, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span>
                    {purchased || lecture.isPreviewFree ? (
                      <PlayCircle size={14} className="text-blue-500" />
                    ) : (
                      <Lock size={14} className="text-gray-500" />
                    )}
                  </span>
                  <p className={purchased || lecture.isPreviewFree ? "text-blue-600" : "text-gray-600"}>
                    {lecture.lectureTitle}
                    {lecture.isPreviewFree && !purchased && " (Free Preview)"}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-1/3">
          <Card className="sticky top-20">
            <CardContent className="p-4 flex flex-col">
              {course?.lectures?.[0]?.videoUrl && (
                <div className="w-full aspect-video mb-4 rounded-lg overflow-hidden">
                  <ReactPlayer
                    width="100%"
                    height={"100%"}
                    url={course.lectures[0].videoUrl}
                    controls={true}
                  />
                </div>
              )}
              <h1 className="font-medium">{course?.lectures?.[0]?.lectureTitle || "Preview Lecture"}</h1>
              <Separator className="my-2" />
              <h1 className="text-lg md:text-xl font-semibold">₹{course?.coursePrice || 0}</h1>
            </CardContent>
            <CardFooter className="flex justify-center p-4">
              {purchased ? (
                <Button onClick={handleContinueCourse} className="w-full">
                  Continue Course
                </Button>
              ) : (
                <BuyCourseButton courseId={courseId} />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
