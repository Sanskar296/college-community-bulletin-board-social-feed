"use client";

function Exams() {
  const examsData = [
    {
      id: 1,
      subject: "Machine Learning",
      date: "2024-03-15",
      time: "09:00 - 12:00",
      venue: "Examination Hall 1",
      type: "Mid-Term",
      syllabus: ["Neural Networks", "Supervised Learning", "Model Evaluation"],
      instructions: ["Bring student ID", "No electronic devices allowed"]
    },
    {
      id: 2,
      subject: "Data Structures",
      date: "2024-03-18",
      time: "14:00 - 17:00",
      venue: "Examination Hall 2",
      type: "Final",
      syllabus: ["Trees", "Graphs", "Dynamic Programming"],
      instructions: ["Scientific calculator allowed", "Bring blue/black pen"]
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-medium mb-6">Examination Schedule</h1>
      
      <div className="grid gap-6">
        {examsData.map(exam => (
          <div key={exam.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-medium">{exam.subject}</h2>
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mt-1">
                  {exam.type} Examination
                </span>
              </div>
              <div className="text-right">
                <p className="text-gray-600">{new Date(exam.date).toLocaleDateString()}</p>
                <p className="text-blue-600 font-medium">{exam.time}</p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-2">Syllabus:</h3>
              <ul className="list-disc list-inside text-gray-600">
                {exam.syllabus.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Instructions:</h3>
              <ul className="list-disc list-inside text-gray-600">
                {exam.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-gray-600">
                <span className="font-medium">Venue:</span> {exam.venue}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Exams;
