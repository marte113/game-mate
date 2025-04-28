import { useState } from "react";
import SelectedGameCard from "./SelectedGameCard";
import SelectedGameDropDown from "./SelectedGameDropDown";
const games = [
  { id: 1, title: "리그 오브 레전드", image: "/images/lol.webp" },
  { id: 2, title: "오버워치", image: "/images/overwatch.jpg" },
  { id: 3, title: "발로란트", image: "/images/valrorant.webp" },
  { id: 4, title: "이터널리턴", image: "/images/eternalreturn.jpg" },
  { id: 5, title: "피파온라인4", image: "/images/fifaonline4.webp" },
  { id: 6, title: "TFT", image: "/images/teamfight.avif" },
  // 추가 게임들...
];

export default function SelectGameModal() {
  const [selectedGames, setSelectedGames] = useState<number[]>([]);
  return (
    <div className="form-control mt-4">
      <label className="label">
        <span className="label-text">게임 카테고리</span>
      </label>

      {/*선택된 게임 목록*/}
      <SelectedGameCard
        selectedGames={selectedGames}
        games={games}
        setSelectedGames={setSelectedGames}
      />

      {/*게임 카테고리 드롭다운*/}
      <SelectedGameDropDown
        games={games}
        selectedGames={selectedGames}
        setSelectedGames={setSelectedGames}
      />
    </div>
  );
}
