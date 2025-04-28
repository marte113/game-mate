"use client";

import React from 'react';
import { FormProvider } from 'react-hook-form';
import BasicInfoCard from "./BasicInfoCard";
import GameSelectionCard from "./GameSelectionCard";
import TagSelectionCard from "./TagSelectionCard";
import YouTubeUrlsCard from "./YouTubeUrlsCard";
import MateRegister from "./MateRegister";
import { Button } from '@/components/ui';
import { useProfileForm } from '@/hooks/useProfileForm';

export default function ProfileInfoSection() {
  const {
    methods,
    onSubmit,
    isLoadingProfile,
    isSaving,
    isError,
    profileQueryError,
    handleCancel,
  } = useProfileForm();

  const { handleSubmit, formState: { errors, isDirty, isSubmitting, isValid } } = methods;

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <div className="card bg-base-100 shadow-xl animate-pulse">
          <div className="card-body">
             <div className="h-8 bg-base-300 rounded w-1/3 mb-6"></div>
             <div className="h-40 bg-base-300 rounded mb-4"></div>
             <div className="h-40 bg-base-300 rounded mb-4"></div>
             <div className="h-20 bg-base-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h3 className="card-title text-error">오류 발생</h3>
            <p className="text-error mb-4">
              {(profileQueryError as Error)?.message || '프로필 정보를 불러오는데 실패했습니다'}
            </p>
            <p className="text-sm">페이지를 새로고침하거나 잠시 후 다시 시도해주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h3 className="card-title">프로필 정보</h3>
              {isDirty && (
                <span className="badge badge-accent">변경사항 있음</span>
              )}
            </div>

            <BasicInfoCard />
            <GameSelectionCard name="selected_games" />
            <YouTubeUrlsCard name="youtube_urls" />
            <MateRegister name="is_mate" />
            <TagSelectionCard name="selected_tags" />

            <div className="flex justify-end gap-2 mt-6">
              {isDirty && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmitting || isSaving}
                disabled={!isDirty || isSubmitting || !isValid || isSaving}
              >
                {isSubmitting || isSaving ? '저장 중...' : '변경사항 저장'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
