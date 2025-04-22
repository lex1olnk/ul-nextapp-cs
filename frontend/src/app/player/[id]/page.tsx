export default async function Page({
    params,
  }: {
    params: Promise<{ id: number }>
  }) {
    const { id } = await params
    return <div>My Post: {id}</div>
  }
  