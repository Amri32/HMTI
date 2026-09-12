interface StrukturCardProps {
  name: string;
  position: string;
}

export default function StrukturCard({ name, position }: StrukturCardProps) {
  return (
    <div className="w-[320px] sm:w-[411px] h-[140px] relative flex-shrink-0">
      <div className="w-[211px] sm:w-[302px] h-[92px] absolute left-[109px] top-9">
        <svg
          width="302" height="46" viewBox="0 0 302 46" fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[211px] sm:w-[302px] h-[46px] absolute left-0 top-0"
        >
          <path d="M302 0H0V46H283.5C289.529 46 291 38 294 27L302 0Z" fill="#EAE0CF" />
        </svg>
        <p className="text-[#000] font-inter text-xl font-semibold leading-[26px] absolute left-10 top-2.5 truncate max-w-[150px] sm:max-w-[200px]">
          {name}
        </p>
        <div className="w-[172px] sm:w-[263px] h-[46px] absolute left-0 top-[46px]">
          <svg
            width="263" height="46" viewBox="0 0 263 46" fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[172px] sm:w-[263px] h-[46px] absolute left-0 top-0"
          >
            <path d="M263 0H0V46H246.889C252.139 46 253.421 38 256.033 27L263 0Z" fill="white" />
          </svg>
          <p className="text-[#000] font-inter text-lg font-medium leading-[23px] absolute left-10 top-3 truncate max-w-[110px] sm:max-w-[170px]">
            {position}
          </p>
        </div>
      </div>
      <div className="w-[100px] sm:w-[140px] h-[100px] sm:h-[140px] absolute left-[5px] sm:left-0 top-[20px] sm:top-0 rounded-full bg-gray-400" />
    </div>
  );
}
