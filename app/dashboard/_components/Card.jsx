export default function Card({title, content, summary}) {
  return (
    <div className="flex flex-col rounded-md bg-base-100 border-b border-gray-400 shadow-md">
      <div className="card-body p-[16px]">
        <h2 className="card-title text-base md:text-lg">{title}</h2>
        <p className="text-lg md:text-xl font-bold">{content}</p>
        <p className="text-xs md:text-sm text-success">{summary}</p>
      </div>
    </div>
  );ㄹ
}
