export const metadata = {
  title: "Contact Us - Padel Liga",
  description: "Get in touch with the Padel Liga team",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 pt-8 pb-10 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-foreground">
          Get In Touch
        </h1>
        <p className="text-xl text-muted-foreground">
          We'd love to hear from you
        </p>
      </div>

      {/* Contact Form */}
      <div className="bg-card border border-border rounded-lg p-8 mb-8">
        <form className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange outline-none transition-all"
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange outline-none transition-all"
              placeholder="your@email.com"
            />
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange outline-none transition-all"
              placeholder="How can we help?"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange outline-none transition-all resize-none"
              placeholder="Tell us more about your inquiry..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-lg transition-all"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* Contact Info */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Email Card */}
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-brand-orange rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-foreground mb-2">Email</h3>
          <a href="mailto:support@padelliga.com" className="text-brand-orange hover:underline">
            support@padelliga.com
          </a>
        </div>

        {/* Support Card */}
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-brand-orange rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-foreground mb-2">Support</h3>
          <p className="text-sm text-muted-foreground">
            Available Monday - Friday<br />
            9:00 AM - 5:00 PM CET
          </p>
        </div>
      </div>

      {/* FAQ Link */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          Looking for quick answers? Check out our{" "}
          <a href="/faq" className="text-brand-orange hover:underline font-semibold">
            FAQ page
          </a>
        </p>
      </div>
    </div>
  );
}
