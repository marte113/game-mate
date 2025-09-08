import { useEffect, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useForm, type UseFormReturn, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-hot-toast"
import isEqual from "lodash/isEqual"
import { ZodError } from "zod"

import {
  profileSchema,
  profilePartialSchema,
  type ProfileDataSchema,
} from "@/libs/schemas/profile.schema"
import { useProfileInfoQuery } from "@/hooks/api/profile/useProfileQueries"
import { useUpdateProfileMutation } from "@/hooks/api/profile/useProfileMutations"
import { queryKeys } from "@/constants/queryKeys"
import { parseApiError, setFormErrors } from "@/utils/errors/errorUtils"

// Custom hook return type
interface UseProfileFormReturn {
  methods: UseFormReturn<ProfileDataSchema> // RHF methods and state
  onSubmit: SubmitHandler<ProfileDataSchema> // Form submission handler
  isLoadingProfile: boolean
  isSaving: boolean
  isError: boolean
  profileQueryError: Error | null
  handleCancel: () => void // Cancel handler
}

export function useProfileForm(): UseProfileFormReturn {
  const queryClient = useQueryClient()

  // --- Data Fetching ---
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    isError,
    error: profileQueryError,
    refetch: refetchProfileInfo, // Add refetch function
  } = useProfileInfoQuery()

  // --- Form Initialization ---
  const methods = useForm<ProfileDataSchema>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      // Keep defaults simple, reset logic handles API data
      nickname: "",
      username: "",
      description: "",
      selected_games: [],
      youtube_urls: [],
      is_mate: false,
      selected_tags: [],
    },
  })
  const {
    reset,
    setError,
    formState: { defaultValues, isDirty },
  } = methods

  // --- Effect for Resetting Form with Fetched Data ---
  useEffect(() => {
    // Only reset if profileData is successfully fetched
    if (profileData) {
      const validatedData = profilePartialSchema.safeParse(profileData)

      if (validatedData.success) {
        // Reset with validated data merged with defaults to ensure all fields exist
        const dataToReset = {
          // Directly use methods.formState.defaultValues here if needed,
          // but it's not a dependency for the effect trigger itself.
          ...methods.formState.defaultValues,
          ...validatedData.data,
        }
        reset(dataToReset)
      } else {
        console.error("Fetched profile data doesn't match schema in hook:", validatedData.error)
        // Use the stable reset function with stable defaultValues reference
        reset(methods.formState.defaultValues)
      }
    } else if (!isLoadingProfile && !isError) {
      // If not loading and no error, but profileData is null, reset to defaults
      // Use the stable reset function with stable defaultValues reference
      reset(methods.formState.defaultValues)
    }
    // Dependencies: profileData (query result), reset function reference, loading/error states
    // defaultValues reference from RHF is stable
  }, [profileData, reset, isLoadingProfile, isError]) // Removed defaultValues

  // --- Data Mutation ---
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfileMutation({
    onSuccess: () => {
      toast.success("프로필이 성공적으로 저장되었습니다")
      // 캐시 무효화는 mutation 내부에서 처리됨
      // 폼 리셋은 useEffect에서 새로운 profileData로 자동 처리
    },
    onError: (error: any) => {
      const parsed = parseApiError(error)
      setFormErrors(setError, parsed.fieldErrors)
      toast.error(parsed.generalMessage)
    },
  })

  // --- Form Submission Handler ---
  // Use useCallback to memoize the onSubmit function
  const onSubmit: SubmitHandler<ProfileDataSchema> = useCallback(
    (data) => {
      const changedData: Partial<ProfileDataSchema> = {}
      // Get current profile data from cache for comparison
      const currentProfileData = queryClient.getQueryData<ProfileDataSchema | null>(
        queryKeys.profile.info(),
      )

      if (currentProfileData) {
        ;(Object.keys(data) as Array<keyof ProfileDataSchema>).forEach((key) => {
          if (!isEqual(data[key], currentProfileData[key])) {
            ;(changedData as any)[key] = data[key]
          }
        })
      }

      // Check if there are actual changes before submitting
      if (Object.keys(changedData).length > 0) {
        // TODO: Add necessary identifiers like ID if API requires for PATCH
        // if(currentProfileData?.id) { changedData.id = currentProfileData.id }
        updateProfile(changedData)
      } else if (isDirty) {
        // If the form is dirty but no deep changes detected (e.g., array manipulation back to original)
        toast("변경된 내용이 없습니다.")
        // Optionally reset to remove dirty state if isEqual is reliable
        reset(currentProfileData ?? defaultValues)
      } else {
        toast("변경된 내용이 없습니다.")
      }
      // If API requires full update: updateProfile(data);
    },
    [queryClient, updateProfile, isDirty, reset, defaultValues],
  ) // Dependencies for onSubmit

  // --- Cancel Handler ---
  const handleCancel = useCallback(() => {
    const currentProfileData = queryClient.getQueryData<ProfileDataSchema | null>(
      queryKeys.profile.info(),
    )
    reset(currentProfileData ?? defaultValues) // Reset to cached data or defaults
  }, [queryClient, reset, defaultValues])

  // --- Return Values ---
  return {
    methods, // Includes control, formState, register, etc.
    onSubmit,
    isLoadingProfile,
    isSaving, // isSubmitting is part of methods.formState
    isError,
    profileQueryError,
    handleCancel,
  }
}
