import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Puxa o guia de programação simplificado (JSON) fornecido pela comunidade iptv-org
    const response = await fetch('https://github.io', {
      // @ts-expect-error Next.js revalidate option
      next: { revalidate: 1800 }, // Atualiza o cache do guia a cada 30 minutos
    });

    if (!response.ok) throw new Error('Falha ao buscar guia de TV');

    const epgData = await response.json();

    // Retorna o guia mapeado para o frontend
    return NextResponse.json(epgData);
  } catch (error) {
    console.error('Erro ao buscar guia de programação EPG:', error);
    // Fallback caso o servidor global esteja em manutenção
    return NextResponse.json(
      {
        mensagem: 'Programação ao vivo indisponível no momento',
        programas: [],
      },
      { status: 500 }
    );
  }
}
