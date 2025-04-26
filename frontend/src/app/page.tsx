import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[10px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="mx-auto"
          src="/ul2.png"
          alt="ul logo"
          width={180}
          height={180}
          priority
        />
        <div className="flex mx-auto">
          <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-light-dark border rounded-e-0 border-gray-300 border-e-0 rounded-s-md">
            <svg className="w-4 h-4 text-light-dark" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 20 20">
                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
            </svg>
          </span>
          <input type="text" id="website-admin" className="rounded-none rounded-e-lg  border bg-light-dark block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5   dark:placeholder-gray-400" placeholder="rvl"/>
          <button className="ml-4 py-1.5 px-6 rounded-sm bg-white text-light-dark">
            Найти
          </button>
        </div>

      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
