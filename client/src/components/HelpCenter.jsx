"use client";

function HelpCenter() {
  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page and following the instructions sent to your email."
    },
    {
      question: "How can I join a discussion room?",
      answer: "Navigate to the Discussions tab, find a room you're interested in, and click the 'Join' button. Some rooms may require approval from moderators."
    },
    // Add more FAQs
  ];

  const contactInfo = {
    email: "support@vishwaniketan.edu",
    phone: "+91-123-456-7890",
    hours: "Monday - Friday: 9:00 AM - 5:00 PM"
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-medium mb-6">Help Center</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-medium mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-4">
                <h3 className="font-medium text-lg mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-medium mb-4">Contact Support</h2>
            <div className="space-y-3">
              <p><span className="font-medium">Email:</span> {contactInfo.email}</p>
              <p><span className="font-medium">Phone:</span> {contactInfo.phone}</p>
              <p><span className="font-medium">Hours:</span> {contactInfo.hours}</p>
            </div>
          </div>

          {/* Support Ticket Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-medium mb-4">Submit a Support Ticket</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Brief description of your issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  placeholder="Detailed explanation of your issue"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;
