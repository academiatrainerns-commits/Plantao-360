import type { Metadata, Viewport } from 'next';
import './style.css';
export const metadata: Metadata={title:'Plantão360 | Sua produção médica',description:'Controle plantões, horas e recebimentos em um só lugar',applicationName:'Plantão360',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'Plantão360',statusBarStyle:'default'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#102840'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
