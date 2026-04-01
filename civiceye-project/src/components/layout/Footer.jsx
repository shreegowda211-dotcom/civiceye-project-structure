import React from "react";
import {Link} from 'react-router-dom';
import { ShieldCheck } from "lucide-react";

export default function Footer() {


  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-8 lg:px-10">
        <div className="grid gap-8 text-sm text-slate-600 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 shadow-md hover:shadow-lg transition">
            <ShieldCheck className="h-7 w-7 text-black" />
            <span className="text-sm font-semibold text-black">CivicEye</span>
          </div>
            <p className="max-w-xs text-xs text-slate-500 md:text-sm">
              Smart Public Issue Reporting &amp; Resolution System for transparent
              urban governance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Quick Links</h3>
            <ul className="mt-3 space-y-1.5 text-xs md:text-sm">
  <li>
    <Link to="/report"className="text-slate-600 transition hover:text-slate-900 hover:translate-x-1 inline-block duration-200">
      Report Issue
    </Link>
  </li>
  <li>
    <Link to="/track" className="text-slate-600 transition hover:text-slate-900 hover:translate-x-1 inline-block duration-200">
      Track Status
    </Link>
  </li>
  <li>
    <Link to="/dashboard" className="text-slate-600 transition hover:text-slate-900 hover:translate-x-1 inline-block duration-200">
      Transparency Dashboard
    </Link>
  </li>
  <li>
    <Link to="/contact" className="text-slate-600 transition hover:text-slate-900 hover:translate-x-1 inline-block duration-200">
      Contact Us
    </Link>
  </li>
</ul>
          </div>

          {/* Departments */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Departments</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600 md:text-sm">
              <li>Roads &amp; Infrastructure</li>
              <li>Sanitation</li>
              <li>Electrical</li>
              <li>Water Supply</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600 md:text-sm">
              <li>Helpline: 1800-XXX-XXXX</li>
              <li>Email: support@civiceye.gov</li>
              <li>Municipal Corporation</li>
              <li>Mon-Sat: 9:00 AM - 6:00 PM</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-slate-200 pt-4 text-center text-[11px] text-slate-500 md:text-xs">
          <p>
            © 2024 CivicEye. A Government of India Initiative. All rights
            reserved.
          </p>
          <p className="mt-1">
            Final Year Engineering Project - Smart India Hackathon
          </p>
        </div>
      </div>
    </footer>
  );
}

