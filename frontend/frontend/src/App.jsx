import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";

function App() {
  // Chatbot state
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hi! Ask me anything about space or asteroids." }
  ]);
  const [chatInput, setChatInput] = useState("");

  // ChatGPT integration
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: "user", text: chatInput };
    setChatMessages((msgs) => [...msgs, userMsg]);
    setChatInput("");
    // Show loading message
    setChatMessages((msgs) => [...msgs, { sender: "bot", text: "Thinking..." }]);
    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput })
      });
      const data = await res.json();
      setChatMessages((msgs) => [
        ...msgs.slice(0, -1), // Remove 'Thinking...'
        { sender: "bot", text: data.reply || "Sorry, no response." }
      ]);
    } catch (err) {
      setChatMessages((msgs) => [
        ...msgs.slice(0, -1),
        { sender: "bot", text: "Sorry, there was an error connecting to ChatGPT." }
      ]);
    }
  };
  const [asteroids, setAsteroids] = useState([]);
  const [hfResults, setHfResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // === NASA API ===
        const NASA_API_KEY = "NxJcliSUnUIawqafmbIU9HTkZACDl4zqXHDI7Qhl"; // Replace with your own for production
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const nasaUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;

        const nasaRes = await fetch(nasaUrl);
        const nasaData = await nasaRes.json();

        const todayAsteroids = nasaData?.near_earth_objects?.[today] || [];
        setAsteroids(todayAsteroids);

        // Optionally: fetch threat analysis from Hugging Face
        // ...existing code...

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <h1 className="text-center mt-20 text-2xl">Loading...</h1>;

  // Helper: get lat/lon from asteroid (mock, as NASA NEO API does not provide direct impact coordinates)
  const getAsteroidLatLon = (asteroid, idx) => {
    // For demo: spread markers globally using index
    const lat = -60 + (idx * 20) % 120; // -60 to +60
    const lon = -180 + (idx * 40) % 360; // -180 to +180
    return [lat, lon];
  };

  // Timeline data (mock: use close_approach_date)
  const timelineEvents = asteroids.map((asteroid, idx) => ({
    id: idx,
    content: asteroid.name,
    start: asteroid.close_approach_data?.[0]?.close_approach_date || "N/A",
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-6">
      <h1 className="text-5xl font-extrabold text-center mb-8 text-yellow-300 drop-shadow-lg tracking-wide animate-pulse">ChronosFlex Asteroids 🚀</h1>

      {/* Map-based Visualization */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-pink-300">Asteroid Impact Map</h2>
        <MapContainer center={[0, 0]} zoom={2} style={{ height: "260px", width: "100%", borderRadius: "1rem", boxShadow: "0 0 24px #6b21a8" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {asteroids.map((asteroid, idx) => {
            const [lat, lon] = getAsteroidLatLon(asteroid, idx);
            return (
              <Marker key={asteroid.id} position={[lat, lon]}>
                <Popup>
                  <strong>{asteroid.name}</strong><br />
                  Diameter: {asteroid?.estimated_diameter?.meters?.estimated_diameter_max?.toFixed(2) || "N/A"} m<br />
                  Miss Distance: {asteroid?.close_approach_data?.[0]?.miss_distance?.kilometers || "N/A"} km
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Animated Impact Simulation */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-cyan-300">Animated Impact Simulation</h2>
        <div className="w-full h-48 bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 flex items-center justify-center rounded-xl relative overflow-hidden shadow-lg">
          {asteroids.slice(0, 1).map((asteroid, idx) => (
            <motion.div
              key={asteroid.id}
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 60, opacity: 1 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-400 rounded-full flex items-center justify-center shadow-2xl border-4 border-white"
            >
              <span role="img" aria-label="asteroid" style={{ fontSize: 40 }}>☄️</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-green-300">Asteroid Events Timeline</h2>
        <div className="w-full h-32 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 flex flex-col items-center justify-center rounded-xl overflow-x-auto shadow-lg">
          <div className="flex space-x-4">
            {timelineEvents.map(event => (
              <div key={event.id} className="px-4 py-2 bg-gradient-to-br from-purple-400 via-pink-300 to-yellow-200 rounded-xl shadow text-sm text-gray-900 font-bold border-2 border-white">
                <strong>{event.content}</strong><br />
                {event.start}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {asteroids.map((asteroid) => {
          const diameter = asteroid?.estimated_diameter?.meters?.estimated_diameter_max;
          const approach = Array.isArray(asteroid?.close_approach_data) ? asteroid.close_approach_data[0] : null;

          return (
            <div key={asteroid.id} className="p-6 bg-gradient-to-br from-indigo-400 via-purple-300 to-pink-200 rounded-2xl shadow-2xl border-4 border-yellow-300">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">{asteroid.name || "Unknown"}</h2>
              <p className="text-lg text-purple-900">Diameter: <span className="font-bold text-yellow-700">{diameter ? diameter.toFixed(2) : "N/A"}</span> m</p>
              <p className="text-lg text-purple-900">Close Approach Date: <span className="font-bold text-green-700">{approach?.close_approach_date || "N/A"}</span></p>
              <p className="text-lg text-purple-900">Miss Distance: <span className="font-bold text-pink-700">{approach?.miss_distance?.kilometers ? parseFloat(approach.miss_distance.kilometers).toFixed(2) : "N/A"}</span> km</p>
            </div>
          );
        })}
      </div>
    {/* Chatbot UI */}
    <div className="fixed bottom-4 right-4 w-80 bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400 rounded-2xl shadow-2xl border-4 border-white z-50">
      <div className="p-3 border-b bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 rounded-t-2xl font-bold text-lg text-blue-900">ChronosFlex Chatbot</div>
      <div className="p-3 h-48 overflow-y-auto flex flex-col gap-2">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={msg.sender === "bot" ? "text-left" : "text-right"}>
            <span className={msg.sender === "bot" ? "bg-blue-100 text-blue-900 px-2 py-1 rounded-xl" : "bg-green-100 text-green-900 px-2 py-1 rounded-xl"}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="p-3 flex gap-2 border-t">
        <input
          type="text"
          className="flex-1 border-2 border-purple-400 rounded-xl px-2 py-1 focus:outline-none focus:border-yellow-400"
          placeholder="Ask a space question..."
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
        />
        <button
          className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 text-white px-3 py-1 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
          onClick={handleSendMessage}
        >Send</button>
      </div>
    </div>
    </div>
  );
}

export default App;
