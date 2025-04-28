'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { ProfileDataSchema } from '@/libs/schemas/profile.schema';

interface MateRegisterProps {
  name: keyof ProfileDataSchema;
}

const MateRegister = React.memo(({ name }: MateRegisterProps) => {
  const { control, formState: { errors } } = useFormContext<ProfileDataSchema>();
  const fieldError = errors[name]?.message;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-4 p-2 border border-base-300 rounded-lg">
        <label htmlFor="mate-toggle" className="label-text cursor-pointer flex-grow">메이트 등록</label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              id="mate-toggle"
              type="checkbox"
              className={`toggle toggle-success ${fieldError ? 'toggle-error' : ''}`}
              checked={!!field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
      </div>
      {fieldError && <p className="text-error text-sm mt-1 pl-2">{fieldError}</p>}
      <div className="text-sm text-base-content/60 mt-2 pl-2">
        메이트로 등록하면 메이트 찾기 페이지에 노출됩니다.
      </div>
    </div>
  );
});

MateRegister.displayName = 'MateRegister';

export default MateRegister;
