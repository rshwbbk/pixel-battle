import { db } from "../db";
import { pixels } from "../db/schema";
import Canvas from "../components/Canvas";

export const revalidate = 0;

export default async function Home() {
  const allPixels = await db.select().from(pixels);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '50px' }}>
      <h1 style={{ letterSpacing: '4px' }}>PIXEL BATTLE</h1>
      <Canvas initialPixels={allPixels} />
    </main>
  );
}