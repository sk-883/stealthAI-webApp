import { 
  Users, 
  Building, 
  Hash 
} from "lucide-react";

type RecentItem = {
  id: number;
  icon: "group" | "company" | "hashtag";
  name: string;
};

type GroupItem = {
  id: number;
  name: string;
};

type RecentSectionProps = {
  recentItems?: RecentItem[];
  groups?: GroupItem[];
};

export default function RecentSection({ 
  recentItems = [
    { id: 1, icon: "group", name: "Front-end Developer Group" },
    { id: 2, icon: "company", name: "Web Development Workshop" },
    { id: 3, icon: "hashtag", name: "#JavaScript" }
  ],
  groups = [
    { id: 1, name: "UX/UI Design Professionals" },
    { id: 2, name: "React Developers" }
  ]
}: RecentSectionProps) {
  
  const renderIcon = (icon: string) => {
    switch(icon) {
      case "group":
        return <Users className="h-5 w-5 mr-2 text-[#666666]" />;
      case "company":
        return <Building className="h-5 w-5 mr-2 text-[#666666]" />;
      case "hashtag":
        return <Hash className="h-5 w-5 mr-2 text-[#666666]" />;
      default:
        return <Users className="h-5 w-5 mr-2 text-[#666666]" />;
    }
  };
  
  return (
    <div className="linkedin-card p-4">
      <h3 className="font-medium text-sm text-[#191919] mb-3">Recent</h3>
      
      {recentItems.map(item => (
        <div key={item.id} className="flex items-center mb-2">
          {renderIcon(item.icon)}
          <a href="#" className="text-sm text-[#666666] hover:text-[#0a66c2]">
            {item.name}
          </a>
        </div>
      ))}
      
      <h3 className="font-medium text-sm text-[#191919] mt-4 mb-3">Groups</h3>
      
      {groups.map(group => (
        <div key={group.id} className="flex items-center mb-2">
          <Users className="h-5 w-5 mr-2 text-[#666666]" />
          <a href="#" className="text-sm text-[#666666] hover:text-[#0a66c2]">
            {group.name}
          </a>
        </div>
      ))}
      
      <div className="mt-3">
        <a href="#" className="text-sm text-[#666666] font-medium hover:text-[#0a66c2] flex items-center">
          Show more
          <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
