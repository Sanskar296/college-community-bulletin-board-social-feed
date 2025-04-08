"use client";

function Schedule() {
  const scheduleData = [
    {
      day: "Monday",
      classes: [
        { time: "09:00 - 10:30", subject: "Machine Learning", room: "Lab 301", professor: "Dr. Rajesh Kumar" },
        { time: "11:00 - 12:30", subject: "Data Structures", room: "Room 201", professor: "Prof. Amit Shah" },
      ]
    },
    {
      day: "Tuesday",
      classes: [
        { time: "10:00 - 11:30", subject: "Web Development", room: "Lab 302", professor: "Prof. Sarah Johnson" },
        { time: "14:00 - 15:30", subject: "Database Systems", room: "Room 205", professor: "Dr. Meera Patel" },
      ]
    },
    // Add more days as needed
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-medium mb-6">Class Schedule</h1>
      
      <div className="grid gap-6">
        {scheduleData.map((day, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-500 text-white px-4 py-2">
              <h2 className="text-lg font-medium">{day.day}</h2>
            </div>
            <div className="divide-y">
              {day.classes.map((classItem, classIndex) => (
                <div key={classIndex} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{classItem.subject}</h3>
                      <p className="text-gray-600">{classItem.professor}</p>
                    </div>
                    <span className="text-blue-600 font-medium">{classItem.time}</span>
                  </div>
                  <p className="text-gray-500 mt-1">Room: {classItem.room}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Schedule;
