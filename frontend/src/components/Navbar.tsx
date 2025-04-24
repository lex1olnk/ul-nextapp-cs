import Link from 'next/link';
import logo from '@/img/ul2.png'
import Image from 'next/image';


export function Navbar() {
  return (
    <nav className="bg-[var(--light-dark)] border-b border-gray-700 fixed w-full z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Левая часть - Логотип и поиск */}
          <div className="flex items-center flex-1">
            {/* Логотип */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className='flex flex-row'>
                <Image src={logo} className="w-10 my-auto" alt="logo"/>
              </Link>
            </div>
            
            {/* Поиск */}
            <div className="ml-6 flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Поиск игроков..."
                  className="block w-full pl-10 pr-3 py-2 rounded-md border text-white placeholder-gray-400 focus:outline-none focus:ring-2  focus:border-transparent"
                />
              </div>
            </div>
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
            
            {/* Кнопка "Мой профиль" */}
            <Link 
              href="/profile" 
              className="px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-slate-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Мой профиль
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
