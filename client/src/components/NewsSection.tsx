import { Circle } from "lucide-react";

type NewsItem = {
  id: number;
  title: string;
  time: string;
  readers: number;
};

type NewsSectionProps = {
  newsItems?: NewsItem[];
};

export default function NewsSection({ 
  newsItems = [
    { id: 1, title: "Tech hiring slows down in Q3", time: "1d ago", readers: 5432 },
    { id: 2, title: "Remote work trends for 2023", time: "2d ago", readers: 11253 },
    { id: 3, title: "AI tools transforming marketing", time: "3d ago", readers: 8741 },
    { id: 4, title: "New cybersecurity regulations", time: "4d ago", readers: 7122 },
    { id: 5, title: "Startup funding increases by 15%", time: "5d ago", readers: 9356 }
  ]
}: NewsSectionProps) {
  return (
    <div className="linkedin-card">
      <div className="p-4">
        <h2 className="font-bold text-[#191919] text-base">LinkedIn News</h2>
        <ul className="mt-3 space-y-3">
          {newsItems.map(item => (
            <li key={item.id} className="flex">
              <div className="mt-1 mr-2">
                <Circle className="h-2 w-2 fill-current text-[#191919]" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-[#191919] hover:text-[#0a66c2] cursor-pointer">
                  {item.title}
                </h3>
                <p className="text-xs text-[#666666] mt-1">
                  {item.time} • {item.readers.toLocaleString()} readers
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <a href="#" className="text-sm text-[#666666] font-medium hover:text-[#0a66c2] flex items-center">
            Show more
            <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
