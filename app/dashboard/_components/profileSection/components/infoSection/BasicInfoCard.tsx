'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ProfileDataSchema } from '@/libs/schemas/profile.schema';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

const BasicInfoCard = React.memo(() => {
  const { register, formState: { errors } } = useFormContext<ProfileDataSchema>();

  return (
    <div className="space-y-4">
      <div className="form-control">
        <label htmlFor="nickname" className="label">
          <span className="label-text">닉네임</span>
        </label>
        <Input
          id="nickname"
          type="text"
          placeholder="닉네임을 입력하세요"
          {...register('nickname')}
          className={`input input-bordered ${errors.nickname ? 'input-error' : ''}`}
          aria-invalid={errors.nickname ? "true" : "false"}
          aria-describedby={errors.nickname ? "nickname-error" : undefined}
        />
        {errors.nickname && <p id="nickname-error" className="text-error text-sm mt-1">{errors.nickname.message}</p>}
      </div>

      <div className="form-control">
        <label htmlFor="username" className="label">
          <span className="label-text">사용자명 (태그)</span>
        </label>
        <Input
          id="username"
          type="text"
          placeholder="고유 사용자명을 입력하세요 (로그인 ID 아님)"
          {...register('username')}
          className={`input input-bordered ${errors.username ? 'input-error' : ''}`}
          aria-invalid={errors.username ? "true" : "false"}
          aria-describedby={errors.username ? "username-error" : undefined}
        />
        {errors.username && <p id="username-error" className="text-error text-sm mt-1">{errors.username.message}</p>}
        <p className="text-xs text-base-content/60 mt-1">프로필 주소 및 태그에 사용됩니다. (영문, 숫자, 밑줄_ 만 가능)</p>
      </div>

      <div className="form-control">
        <label htmlFor="description" className="label">
          <span className="label-text">소개</span>
        </label>
        <Textarea
          id="description"
          placeholder="자신을 소개해주세요."
          {...register('description')}
          className={`textarea textarea-bordered ${errors.description ? 'textarea-error' : ''}`}
          rows={4}
          aria-invalid={errors.description ? "true" : "false"}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        {errors.description && <p id="description-error" className="text-error text-sm mt-1">{errors.description.message}</p>}
      </div>
    </div>
  );
});

BasicInfoCard.displayName = 'BasicInfoCard';

export default BasicInfoCard; 