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
          <div key={groupIdx} className="flex items-center shrink-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 px-4 shrink-0">
                <a href="https://www.listbulb.com/tools/addsubtitles" target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center">
                  <img src="https://www.listbulb.com/featured-on-listbulb-light.svg" alt="Featured on ListBulb" className="h-[21px] md:h-[27px] w-auto hover:opacity-80 transition-opacity" />
                </a>
                <a href="https://findly.tools/addsubtitles?utm_source=addsubtitles" target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center">
                  <img src="https://findly.tools/badges/findly-tools-badge-light.svg" alt="Featured on Findly.tools" className="h-[27px] md:h-[32px] w-auto hover:opacity-80 transition-opacity" />
                </a>
                <a href="https://starterbest.com" target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center">
                  <img src="https://starterbest.com/badages-awards.svg"
                    alt="Featured on Starter Best" style={{ height: "36px", width: "auto" }} />
                </a>

                <a href="https://huzzler.so/products/7eJFWNheLV/addsubtitles?utm_source=huzzler_product_website&utm_medium=badge&utm_campaign=free_listing" target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center">
                  <img alt="Huzzler Embed Badge" src="https://huzzler.so/assets/images/embeddable-badges/featured.png" style={{ height: "37px", width: "106px" }} />
                </a>

              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
