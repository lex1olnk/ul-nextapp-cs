import Link from 'next/link';
import logo from '@/img/ul2.png'
import Image from 'next/image';


export function Navbar() {
  return (
    <nav className="bg-[var(--light-dark)] border-b border-gray-700 fixed w-full z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16">
          
          {/* Левая часть - Логотип и поиск */}
          <div className="flex items-center flex-1">
            {/* Логотип */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className='flex flex-row'>
                <Image src={logo} className="w-10 my-auto" alt="logo"/>
              </Link>
            </div>
            {/* Поиск */}
          </div>
          
          {/* Правая часть - Кнопки */}
          <div className="ml-4 flex items-center space-x-4">
            {/* Кнопка "Топ 15" */}
            <Link 
              href="/matches" 
              className="px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-slate-700 transition-colors"
            >
              Топ 15
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
