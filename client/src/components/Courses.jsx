"use client";

function Courses() {
  const coursesList = [
    {
      id: 1,
      code: "CSE301",
      name: "Artificial Intelligence & Machine Learning",
      instructor: "Dr. Rajesh Kumar",
      credits: 4,
      description: "Introduction to AI concepts, machine learning algorithms, and practical applications.",
      schedule: "Mon, Wed 10:00-11:30 AM"
    },
    {
      id: 2,
      code: "CSE302",
      name: "Data Structures and Algorithms",
      instructor: "Prof. Sanskar Kumar",
      credits: 4,
      description: "Advanced data structures, algorithm design, and complexity analysis.",
      schedule: "Tue, Thu 2:00-3:30 PM"
    },
    {
      id: 3,
      code: "CSE303",
      name: "Web Development Technologies",
      instructor: "Prof. Amit Shah",
      credits: 3,
      description: "Modern web development including React, Node.js, and database integration.",
      schedule: "Wed, Fri 1:00-2:30 PM"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-medium mb-6">Current Courses</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {coursesList.map(course => (
          <div key={course.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{course.name}</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {course.code}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">{course.description}</p>
              <div className="text-sm">
                <p><span className="font-medium">Instructor:</span> {course.instructor}</p>
                <p><span className="font-medium">Credits:</span> {course.credits}</p>
                <p><span className="font-medium">Schedule:</span> {course.schedule}</p>
              </div>
              <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Course Details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;
