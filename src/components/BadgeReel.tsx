import React from 'react';

export default function BadgeReel() {
  return (
    <div
      className="w-full overflow-hidden flex py-4"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
      }}
    >
      <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
        {[...Array(2)].map((_, groupIdx) => (
          <div key={groupIdx} className="flex items-center">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 px-4">
                <a href="https://www.listbulb.com/tools/addsubtitles" target="_blank" rel="noopener noreferrer">
                  <img src="https://www.listbulb.com/featured-on-listbulb-light.svg" alt="Featured on ListBulb" className="h-100 w-150 hover:opacity-80 transition-opacity" />
                </a>
                <a href="https://findly.tools/addsubtitles?utm_source=addsubtitles" target="_blank" rel="noopener noreferrer">
                  <img src="https://findly.tools/badges/findly-tools-badge-light.svg" alt="Featured on Findly.tools" className="h-32 w-auto hover:opacity-80 transition-opacity" />
                </a>
                <a href="https://starterbest.com" target="_blank" rel="noopener noreferrer">
                  <img src="https://starterbest.com/badages-awards.svg"
                    alt="Featured on Starter Best" style={{ height: "54px", width: "auto" }} />
                </a>

                <a href="https://huzzler.so/products/7eJFWNheLV/addsubtitles?utm_source=huzzler_product_website&utm_medium=badge&utm_campaign=free_listing" target="_blank" rel="noopener noreferrer">
                  <img alt="Huzzler Embed Badge" src="https://huzzler.so/assets/images/embeddable-badges/featured.png" width="159" height="55" />
                </a>

              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
