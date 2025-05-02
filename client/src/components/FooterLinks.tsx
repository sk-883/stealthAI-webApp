export default function FooterLinks() {
  return (
    <div className="text-xs text-[#666666] p-3">
      <div className="flex flex-wrap">
        <a href="#" className="hover:text-[#0a66c2] hover:underline mr-3 mb-1">About</a>
        <a href="#" className="hover:text-[#0a66c2] hover:underline mr-3 mb-1">Accessibility</a>
        <a href="#" className="hover:text-[#0a66c2] hover:underline mr-3 mb-1">Help Center</a>
        <a href="#" className="hover:text-[#0a66c2] hover:underline mr-3 mb-1">Privacy & Terms</a>
        <a href="#" className="hover:text-[#0a66c2] hover:underline mr-3 mb-1">Ad Choices</a>
        <a href="#" className="hover:text-[#0a66c2] hover:underline mr-3 mb-1">Advertising</a>
        <a href="#" className="hover:text-[#0a66c2] hover:underline mr-3 mb-1">Business Services</a>
      </div>
      <div className="mt-3">
        <span>LinkedUp Corporation © {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
