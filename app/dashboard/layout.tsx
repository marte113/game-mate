export default async function LayoutPrivate({ children }: { children: React.ReactNode }) {
  // const supabase = createServerComponentClient({ cookies });

  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();

  // if (!session) {
  //   redirect(config.auth.loginUrl);
  // }

  return (
    <>
      <div className="flex min-h-screen bg-base-200">
        <div className="flex-1 p-2">{children}</div>
      </div>
    </>
  )
}
