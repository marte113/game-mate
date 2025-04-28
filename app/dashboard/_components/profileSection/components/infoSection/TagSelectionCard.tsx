'use client';

import React, { useCallback } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { ProfileDataSchema } from '@/libs/schemas/profile.schema';

// TODO: Move userTags data to a constants file or fetch from API
const userTags = [
  { id: 1, name: "친절함" },
  { id: 2, name: "유머러스" },
  { id: 3, name: "열정적" },
  { id: 4, name: "침착함" },
  { id: 5, name: "전략적" },
  { id: 6, name: "공격적" },
  { id: 7, name: "영어가능" },
  { id: 8, name: "초보환영" },
  { id: 9, name: "경쟁지향" },
  { id: 10, name: "재밌음" },
];

// Define props including the 'name'
interface TagSelectionCardProps {
  name: keyof ProfileDataSchema;
}

const TagSelectionCard = React.memo(({ name }: TagSelectionCardProps) => {
  // Get RHF methods
  const { control, getValues, setValue, formState: { errors } } = useFormContext<ProfileDataSchema>();
  const fieldError = errors[name]?.message;

  // 태그 선택/해제 처리 (wrapped with useCallback)
  const toggleTag = useCallback((tagName: string) => {
    const currentSelection = (getValues(name) as string[] | undefined) ?? [];
    let newSelection: string[];

    if (currentSelection.includes(tagName)) {
      newSelection = currentSelection.filter(tName => tName !== tagName);
    } else {
      // 최대 5개까지만 선택 가능
      if (currentSelection.length < 5) {
        newSelection = [...currentSelection, tagName];
      } else {
        newSelection = currentSelection;
        toast.error('태그는 최대 5개까지 선택 가능합니다.');
      }
    }
    // Update RHF state only if selection actually changed
    if (newSelection !== currentSelection) {
      // Added name to dependencies as it's used in setValue/getValues
      setValue(name, newSelection, { shouldValidate: true, shouldDirty: true });
    }
  }, [getValues, setValue, name]);

  return (
    <div className="form-control mt-4">
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // Get the array value from RHF state
          const selectedTagsValue = (field.value as string[] | undefined) ?? [];

          return (
            <>
              <label className="label">
                <span className="label-text">나를 나타내는 태그</span>
                <span className="label-text-alt">{selectedTagsValue.length}/5</span>
              </label>

              {fieldError && <p className="text-error text-sm mb-2">{fieldError}</p>}

              <div className="flex flex-wrap gap-2 mt-2">
                {userTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`badge ${
                      selectedTagsValue.includes(tag.name)
                        ? "badge-primary"
                        : "badge-outline"
                    } p-3 cursor-pointer transition-colors`}
                    onClick={() => toggleTag(tag.name)}
                    disabled={
                      selectedTagsValue.length >= 5 && !selectedTagsValue.includes(tag.name)
                    }
                    aria-pressed={selectedTagsValue.includes(tag.name)}
                  >
                    {tag.name}
                    {selectedTagsValue.includes(tag.name) && (
                      <span className="ml-1">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-base-content/60 mt-2">
                최대 5개까지 선택 가능합니다.
              </p>
            </>
          );
        }}
      />
    </div>
  );
});

TagSelectionCard.displayName = 'TagSelectionCard';

export default TagSelectionCard; 