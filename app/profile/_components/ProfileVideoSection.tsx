'use client';

import { VideoInfo, ProfileVideoSectionProps } from '@/app/profile/_types/profile.types'; // 필요한 타입 임포트

// YouTube URL을 embed URL로 변환하는 함수
function processYoutubeUrls(urls: readonly string[] | null): VideoInfo[] {
    if (!urls) return []

    return urls.map((url, index) => {
        let videoId = ''
        try {
          if (url.includes('watch?v=')) {
            videoId = new URL(url).searchParams.get('v') || ''
          } else if (url.includes('youtu.be/')) {
            videoId = new URL(url).pathname.substring(1)
          } else {
             videoId = url.split('/').pop() || ''
          }
        } catch (e) {
            console.error("Error parsing YouTube URL:", url, e)
        }

        return {
          id: videoId || `video-${index}`,
          embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : '',
        }
     }).filter(video => video.embedUrl)
}

// 컴포넌트 이름과 props를 ProfileVideoSectionProps에 맞게 수정
export default function ProfileVideoSection({ youtubeUrls }: ProfileVideoSectionProps) {

  // props로 받은 youtubeUrls를 처리
  const videos = processYoutubeUrls(youtubeUrls);

  // 비디오 없으면 렌더링 안 함
  if (videos.length === 0) {
    // 로딩 상태는 이 컴포넌트에서 관리하지 않음 (부모 컴포넌트에서 처리)
    return null
    // 또는 "업로드된 영상이 없습니다." 같은 메시지 표시 가능
    // return <div className="card bg-base-100 shadow-md"><div className="card-body"><p className="text-center text-base-content/60">업로드된 영상이 없습니다.</p></div></div>;
  }

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">게임 영상</h3>
          {/* TODO: 영상 더보기 기능? */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 최대 2개 표시 예시 */}
          {videos.map((video) => (
            <div
              key={video.id}
              className="relative aspect-video rounded-lg overflow-hidden"
            >
              <iframe
                className="absolute inset-0 w-full h-full"
                src={video.embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
              ></iframe>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




