import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const suburb = searchParams.get('suburb') || 'Property Market';
    const price = searchParams.get('price') || 'N/A';
    const properties = searchParams.get('properties') || '0';
    const sales = searchParams.get('sales') || '0';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage: 'linear-gradient(to bottom right, #3b82f6 0%, #1e40af 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              textAlign: 'center',
            }}
          >
            {/* Main Title */}
            <div
              style={{
                fontSize: 80,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 30,
                textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              {suburb}
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 32,
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: 60,
              }}
            >
              New Zealand Property Market
            </div>

            {/* Stats Grid */}
            <div
              style={{
                display: 'flex',
                gap: 40,
                marginBottom: 40,
              }}
            >
              {/* Median Price Card */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '30px 40px',
                  borderRadius: 16,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginBottom: 10,
                  }}
                >
                  Median Price
                </div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {price}
                </div>
              </div>

              {/* Properties Card */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '30px 40px',
                  borderRadius: 16,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginBottom: 10,
                  }}
                >
                  Properties
                </div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {properties}
                </div>
              </div>

              {/* Sales Card */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '30px 40px',
                  borderRadius: 16,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginBottom: 10,
                  }}
                >
                  Recent Sales
                </div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {sales}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                fontSize: 28,
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Free Property Valuations & Market Insights
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`Error generating OG image: ${e.message}`);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
