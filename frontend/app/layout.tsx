import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Decant — A life in wine',description:'Your personal cellar, tasting notebook, and wine academy. Stay curious. Drink thoughtfully.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
