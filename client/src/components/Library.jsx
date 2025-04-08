"use client";

function Library() {
  const resources = [
    {
      id: 1,
      title: "Introduction to Machine Learning",
      type: "E-Book",
      author: "Dr. Andrew Smith",
      format: "PDF",
      size: "15 MB",
      downloads: 234
    },
    {
      id: 2,
      title: "Data Structures Practice Problems",
      type: "Study Material",
      author: "Prof. Sarah Johnson",
      format: "PDF",
      size: "8 MB",
      downloads: 567
    },
    {
      id: 3,
      title: "Web Development Course Videos",
      type: "Video Series",
      author: "Tech Learning Hub",
      format: "MP4",
      size: "1.2 GB",
      downloads: 890
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-medium mb-2">Digital Library Resources</h1>
        <p className="text-gray-600">Access study materials, e-books, and video lectures</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="search"
          placeholder="Search resources..."
          className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Resources List */}
      <div className="grid gap-4">
        {resources.map(resource => (
          <div key={resource.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{resource.title}</h3>
                <p className="text-gray-600 text-sm">{resource.author}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                resource.type === 'E-Book' ? 'bg-green-100 text-green-800' :
                resource.type === 'Study Material' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {resource.type}
              </span>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500 space-x-4">
              <span>Format: {resource.format}</span>
              <span>Size: {resource.size}</span>
              <span>{resource.downloads} downloads</span>
            </div>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full">
              Download Resource
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Library;
