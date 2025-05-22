'use client'

import Link from "next/link"


export default function Footer() {
    return (
        <footer className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold">
                Skin<span className="text-red-600">tegrity</span>
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                © {new Date().getFullYear()} Skintegrity. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    )
}
