import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <p className="text-gray-300">
              A comprehensive knowledge hub for AI red teaming prompts and evaluation protocols, developed by UC
              Berkeley's Risk & Security Lab.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/documentation" className="hover:text-white">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api-reference" className="hover:text-white">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/contributing-guide" className="hover:text-white">
                  Contributing Guide
                </Link>
              </li>
              <li>
                <Link href="/research-papers" className="hover:text-white">
                  Research Papers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300">
              Berkeley Risk & Security Lab
              <br />
              University of California, Berkeley
              <br />
              <a href="mailto:brsl@berkeley.edu" className="hover:text-white">
                brsl@berkeley.edu
              </a>
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 UC Berkeley Risk & Security Lab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
