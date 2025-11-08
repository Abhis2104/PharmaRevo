import React, { useState } from 'react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm PharmaBot 🤖 How can I help you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');

  const quickActions = [
    { text: "How to donate medicines?", action: "donate" },
    { text: "Check expiry dates", action: "expiry" },
    { text: "Dashboard help", action: "dashboard" },
    { text: "Medicine recommendations", action: "recommend" }
  ];

  const responses = {
    donate: "To donate medicines:\n1. Go to Donor Dashboard\n2. Fill medicine details (name, expiry, quantity)\n3. Add pickup address and contact info\n4. Upload medicine photo (optional)\n5. Submit for admin verification\n\nEnsure medicines are unexpired and in good condition! 💊",
    
    expiry: "To check expiry dates:\n📅 Look for 'EXP' or 'Expiry' on medicine packaging\n📅 Check near 'MFG' (Manufacturing) date\n📅 Format: MM/YYYY or DD/MM/YYYY\n📅 Don't donate if expired or expiring within 6 months\n\nIf unclear, upload a clear photo for verification! 📸",
    
    dashboard: "Dashboard Help:\n🤝 Donor: Add donations, track status\n🏪 Pharmacy: Upload stock, set prices\n🏭 Company: Submit batches, CSR tracking\n🏥 NGO: Search medicines, request items\n👑 Admin: Verify all submissions\n\nEach dashboard has specific tabs for different functions!",
    
    recommend: "For medicine recommendations, please describe your symptoms and I'll suggest common medicines:\n\n💊 Fever/Pain: Paracetamol, Ibuprofen\n🤧 Cold/Cough: Cetirizine, Cough syrup\n🤢 Acidity: Antacids, Omeprazole\n💊 Headache: Aspirin, Paracetamol\n\n⚠️ Always consult a doctor for proper diagnosis!"
  };

  const handleQuickAction = (action: string) => {
    const userMessage: Message = {
      id: messages.length + 1,
      text: quickActions.find(qa => qa.action === action)?.text || '',
      isBot: false,
      timestamp: new Date()
    };

    const botResponse: Message = {
      id: messages.length + 2,
      text: responses[action as keyof typeof responses],
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    let botResponseText = "I understand you're asking about: " + inputText + "\n\n";

    // Simple keyword matching
    const input = inputText.toLowerCase();
    if (input.includes('donate') || input.includes('donation')) {
      botResponseText = responses.donate;
    } else if (input.includes('expiry') || input.includes('expire')) {
      botResponseText = responses.expiry;
    } else if (input.includes('dashboard') || input.includes('help')) {
      botResponseText = responses.dashboard;
    } else if (input.includes('fever') || input.includes('pain') || input.includes('headache')) {
      botResponseText = "For fever/pain/headache:\n💊 Paracetamol 500mg\n💊 Ibuprofen 400mg\n\n⚠️ Consult doctor if symptoms persist!";
    } else if (input.includes('cold') || input.includes('cough')) {
      botResponseText = "For cold/cough:\n🤧 Cetirizine 10mg\n🍯 Honey-based cough syrup\n🌿 Steam inhalation\n\n⚠️ See doctor if fever develops!";
    } else {
      botResponseText = "I can help you with:\n• Medicine donations\n• Expiry date checking\n• Dashboard navigation\n• Basic medicine recommendations\n\nPlease use the quick actions below or ask specific questions! 😊";
    }

    const botResponse: Message = {
      id: messages.length + 2,
      text: botResponseText,
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
          >
            <span className="text-2xl">💬</span>
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🤖</span>
              <span className="font-semibold">PharmaBot</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg text-sm ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <div className="whitespace-pre-line">{message.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="p-2 border-t">
            <div className="grid grid-cols-2 gap-1 mb-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                >
                  {action.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t flex space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;