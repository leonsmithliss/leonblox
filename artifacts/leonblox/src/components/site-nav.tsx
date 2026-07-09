import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src="/logo.png" alt="LeonBlox logo" className="w-20 h-20 rounded-full object-cover" />
            <span className="font-display font-bold text-2xl tracking-wider uppercase text-foreground">
              LEON<span className="text-primary">BLOX</span>
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 font-display text-sm font-semibold tracking-widest text-muted-foreground">
          <Link href="/#about" className="hover:text-primary transition-colors">ABOUT</Link>
          <Link href="/videos" className="hover:text-primary transition-colors">CONTENT</Link>
          <Link href="/upcoming" className="hover:text-primary transition-colors">UPCOMING</Link>
          <Link href="/message" className="hover:text-primary transition-colors">SEND A MESSAGE TO LIVESTREAM</Link>
          <Link href="/merch" className="hover:text-primary transition-colors">MERCH</Link>
          <Link href="/signup" className="hover:text-primary transition-colors">SIGN UP</Link>
          <div className="relative">
            <Button
              onClick={() => {
                const menu = document.getElementById("follow-menu-nav");
                menu?.classList.toggle("hidden");
              }}
              className="font-display font-bold tracking-widest rounded-none shadow-[0_0_10px_rgba(0,255,255,0.3)] hover:shadow-[0_0_20px_rgba(0,255,255,0.6)]"
            >
              FOLLOW ME
            </Button>
            <div
              id="follow-menu-nav"
              className="hidden absolute right-0 mt-2 flex-col bg-black/95 border border-cyan-500 rounded-lg overflow-hidden min-w-[220px] z-50"
            >
              <a href="https://www.youtube.com/@LeonBloxOfficial" target="_blank" rel="noopener noreferrer" className="block px-4 py-3 hover:bg-cyan-500/20">YouTube</a>
              <a href="https://www.instagram.com/leonbloxofficial/" target="_blank" rel="noopener noreferrer" className="block px-4 py-3 hover:bg-cyan-500/20">Instagram</a>
              <a href="https://discord.gg/pP32EHWq77" target="_blank" rel="noopener noreferrer" className="block px-4 py-3 hover:bg-cyan-500/20">Discord</a>
            </div>
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-background border-t border-border flex flex-col font-display text-sm font-semibold tracking-widest">
          <Link href="/#about" onClick={() => setMenuOpen(false)} className="px-6 py-4 border-b border-border hover:text-primary transition-colors">ABOUT</Link>
          <Link href="/videos" onClick={() => setMenuOpen(false)} className="px-6 py-4 border-b border-border hover:text-primary transition-colors">CONTENT</Link>
          <Link href="/upcoming" onClick={() => setMenuOpen(false)} className="px-6 py-4 border-b border-border hover:text-primary transition-colors">UPCOMING</Link>
          <Link href="/message" onClick={() => setMenuOpen(false)} className="px-6 py-4 border-b border-border hover:text-primary transition-colors">SEND A MESSAGE TO LIVESTREAM</Link>
          <Link href="/merch" onClick={() => setMenuOpen(false)} className="px-6 py-4 border-b border-border hover:text-primary transition-colors">MERCH</Link>
          <Link href="/signup" onClick={() => setMenuOpen(false)} className="px-6 py-4 border-b border-border hover:text-primary transition-colors">SIGN UP</Link>
          <a href="https://www.youtube.com/@LeonBloxOfficial" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="px-6 py-4 border-b border-border hover:text-primary transition-colors">YOUTUBE</a>
          <a href="https://www.instagram.com/leonbloxofficial/" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="px-6 py-4 border-b border-border hover:text-primary transition-colors">INSTAGRAM</a>
          <a href="https://discord.gg/pP32EHWq77" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="px-6 py-4 hover:text-primary transition-colors">DISCORD</a>
        </div>
      )}
    </header>
  );
}
