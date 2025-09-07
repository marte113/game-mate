import { z } from "zod"

// GET /api/games/by-titles?titles=LOL,OW,VAL
export const gamesByTitlesGetQuerySchema = z.object({
  titles: z.preprocess(
    (v) => {
      if (typeof v === "string") {
        return v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      }
      return []
    },
    z
      .array(z.string().min(1))
      .min(1, { message: "titles는 최소 1개 이상이어야 합니다." })
      .max(20, { message: "titles는 최대 20개까지 허용됩니다." }),
  ),
})

export type GamesByTitlesGetQuery = z.infer<typeof gamesByTitlesGetQuerySchema>
