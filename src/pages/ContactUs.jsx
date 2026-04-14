import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useState } from "react";

export default function ContactUs() {
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");
    try {
      await fetch("https://formspree.io/f/xwkgyyqg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });
      setStatus("Message sent!");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("Failed to send. Please try again later.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Mail className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-heading font-black">Contact Us</h1>
        <p className="text-sm text-muted-foreground">Get in touch with the Econ-Go team</p>
      </motion.div>

      <div className="text-center text-muted-foreground text-sm">
        Coming soon.
      </div>
      <div className="max-w-md mx-auto p-8 bg-background rounded-lg shadow mt-10">
        <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              className="w-full border rounded px-3 py-2"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Message</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              name="message"
              required
              rows={4}
              value={form.message}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-primary/90"
          >
            Send Message
          </button>
          {status && <div className="text-center text-sm mt-2">{status}</div>}
        </form>
        <div className="text-xs text-muted-foreground mt-6 text-center">
          Or email us directly at{" "}
          <a href="mailto:econgo321@gmail.com" className="underline text-primary">
            econgo321@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
