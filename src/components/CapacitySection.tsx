const ROTATE = '[transform-box:fill-box] [transform-origin:50%_50%]'

export default function CapacitySection() {
  return (
    <section
      id="capacity"
      className="Capacity relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-light px-2.5"
    >
      <p className="Capacity-title relative z-1 w-75 text-center font-manrope text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.15em] text-dark md:w-[40.75rem] md:text-[1.875rem] md:tracking-[-0.03em] lg:w-150 lg:text-[1.75rem] lg:font-medium lg:tracking-[-0.0714em]">
        What remains is not a feeling, but a capacity.
        <br className="hidden md:block" />
        The capacity to focus without tension, to think without overload, and to
        act with clarity.
      </p>

      <svg
        aria-hidden
        className="Capacity-circles-wrap pointer-events-none absolute left-1/2 top-1/2 h-[32.4969rem] w-[35.3144rem] max-w-none -translate-x-1/2 -translate-y-1/2 md:hidden"
        viewBox="0 0 565.031 519.95"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="capacityCircle3GradientMobile"
            x1="387.957"
            y1="97.8437"
            x2="201.598"
            y2="435.522"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.131846" stopColor="#F5F2EC" />
            <stop offset="0.5" stopColor="#544F4C" />
            <stop offset="0.906408" stopColor="#F5F2EC" />
          </linearGradient>
          <linearGradient
            id="capacityCircle2GradientMobile"
            x1="177.447"
            y1="97.9506"
            x2="363.79"
            y2="435.636"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.131846" stopColor="#F5F2EC" />
            <stop offset="0.5" stopColor="#544F4C" />
            <stop offset="0.906408" stopColor="#F5F2EC" />
          </linearGradient>
          <linearGradient
            id="capacityCircle1GradientMobile"
            x1="282.599"
            y1="71.0461"
            x2="282.599"
            y2="448.979"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.131846" stopColor="#F5F2EC" />
            <stop offset="0.5" stopColor="#544F4C" />
            <stop offset="0.906408" stopColor="#F5F2EC" />
          </linearGradient>
        </defs>
        <path
          className={`${ROTATE} animate-[spin-slow_55s_linear_infinite]`}
          d="M248.511 80.5995C312.127 70.3201 381.921 83.2585 434.014 129.236C474.369 164.854 492.784 203.72 495.313 242.437C497.843 281.163 484.482 319.79 461.187 354.923C408.748 434.011 300.792 483.902 188.754 427.648C75.9958 371.032 52.3922 253.295 100.253 171.162C127.517 124.375 184.883 90.8809 248.511 80.5995Z"
          stroke="url(#capacityCircle3GradientMobile)"
          strokeOpacity="0.8"
        />
        <path
          className={`${ROTATE} animate-[spin-slow-reverse_40s_linear_infinite]`}
          d="M98.6052 201.164C117.495 145.356 161.012 95.7681 227.675 76.2067C279.319 61.0523 324.172 64.9996 361.755 81.5804C399.347 98.1655 429.712 127.412 452.327 162.924C503.237 242.873 501.71 353.166 398.46 415.719C294.548 478.672 173.117 440.992 117.283 363.242C85.4779 318.953 79.7121 256.983 98.6052 201.164Z"
          stroke="url(#capacityCircle2GradientMobile)"
          strokeOpacity="0.8"
        />
        <path
          className={`${ROTATE} animate-[spin-slow_47.5s_linear_infinite]`}
          d="M164.313 122.278C209.025 83.3436 270.425 61.4064 334.776 76.1819C384.631 87.6291 418.919 112.248 440.659 144.263C462.404 176.287 471.621 215.752 471.252 256.925C470.421 349.62 411.085 443.51 294.427 448.294C177.022 453.108 98.406 363.303 94.0866 270.165C91.6263 217.112 119.593 161.219 164.313 122.278Z"
          stroke="url(#capacityCircle1GradientMobile)"
          strokeOpacity="0.8"
        />
      </svg>

      <svg
        aria-hidden
        className="Capacity-circles-wrap pointer-events-none absolute left-1/2 top-1/2 hidden h-[56.25rem] w-[61.1271rem] max-w-none -translate-x-1/2 -translate-y-1/2 md:block lg:hidden"
        viewBox="0 0 978.033 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="capacityCircle3GradientTablet"
            x1="671.544"
            y1="169.345"
            x2="349.019"
            y2="753.82"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.131846" stopColor="#F5F2EC" />
            <stop offset="0.5" stopColor="#544F4C" />
            <stop offset="0.906408" stopColor="#F5F2EC" />
          </linearGradient>
          <linearGradient
            id="capacityCircle2GradientTablet"
            x1="307.156"
            y1="169.53"
            x2="629.653"
            y2="754.018"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.131846" stopColor="#F5F2EC" />
            <stop offset="0.5" stopColor="#544F4C" />
            <stop offset="0.906408" stopColor="#F5F2EC" />
          </linearGradient>
          <linearGradient
            id="capacityCircle1GradientTablet"
            x1="489.172"
            y1="122.964"
            x2="489.172"
            y2="777.079"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.131846" stopColor="#F5F2EC" />
            <stop offset="0.5" stopColor="#544F4C" />
            <stop offset="0.906408" stopColor="#F5F2EC" />
          </linearGradient>
        </defs>
        <path
          className={`${ROTATE} animate-[spin-slow_55s_linear_infinite]`}
          d="M430.115 139.151C540.328 121.345 661.262 143.754 751.529 223.416C821.442 285.114 853.366 352.461 857.75 419.569C862.135 486.686 838.974 553.614 798.62 614.468C707.763 751.482 520.685 837.941 326.541 740.473C131.179 642.393 90.2593 438.404 173.206 296.079C220.471 214.979 319.891 156.96 430.115 139.151Z"
          stroke="url(#capacityCircle3GradientTablet)"
          strokeOpacity="0.8"
        />
        <path
          className={`${ROTATE} animate-[spin-slow-reverse_40s_linear_infinite]`}
          d="M170.324 348.052C203.05 251.375 278.452 165.454 393.976 131.559C483.451 105.307 561.189 112.139 626.339 140.878C691.498 169.622 744.112 220.301 783.286 281.81C871.489 420.305 868.865 611.423 689.936 719.812C509.886 828.88 299.461 763.6 202.704 628.879C147.57 552.114 137.594 444.739 170.324 348.052Z"
          stroke="url(#capacityCircle2GradientTablet)"
          strokeOpacity="0.8"
        />
        <path
          className={`${ROTATE} animate-[spin-slow_47.5s_linear_infinite]`}
          d="M284.182 211.358C361.647 143.91 468.046 105.893 579.57 131.497C665.95 151.328 725.384 193.986 763.07 249.48C800.763 304.983 816.728 373.367 816.089 444.681C814.65 605.256 711.837 767.969 509.661 776.258C306.219 784.6 169.982 628.995 162.496 467.611C158.231 375.654 206.708 278.813 284.182 211.358Z"
          stroke="url(#capacityCircle1GradientTablet)"
          strokeOpacity="0.8"
        />
      </svg>

      <svg
        aria-hidden
        className="Capacity-circles-wrap pointer-events-none absolute left-1/2 top-1/2 hidden h-[130.6125rem] w-[141.9371rem] max-w-none -translate-x-1/2 -translate-y-1/2 lg:block"
        viewBox="0 0 2270.99 2089.8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="capacityCircle3Gradient"
            x1="1558.7"
            y1="393.256"
            x2="809.522"
            y2="1750.22"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.131846" stopColor="#F5F2EC" />
            <stop offset="0.5" stopColor="#544F4C" />
            <stop offset="0.906408" stopColor="#F5F2EC" />
          </linearGradient>
          <linearGradient
            id="capacityCircle2Gradient"
            x1="712.928"
            y1="393.686"
            x2="1462.04"
            y2="1750.68"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.131846" stopColor="#F5F2EC" />
            <stop offset="0.5" stopColor="#544F4C" />
            <stop offset="0.906408" stopColor="#F5F2EC" />
          </linearGradient>
          <linearGradient
            id="capacityCircle1Gradient"
            x1="1135.4"
            y1="285.551"
            x2="1135.4"
            y2="1804.55"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.131846" stopColor="#F5F2EC" />
            <stop offset="0.5" stopColor="#544F4C" />
            <stop offset="0.906408" stopColor="#F5F2EC" />
          </linearGradient>
        </defs>
        <path
          className={`${ROTATE} animate-[spin-slow_55s_linear_infinite]`}
          d="M998.232 322.509C1254.21 281.131 1535.13 333.203 1744.82 518.349C1907.2 661.719 1981.38 818.255 1991.57 974.272C2001.76 1130.3 1947.95 1285.85 1854.22 1427.26C1643.18 1745.67 1208.58 1946.64 757.586 1720.11C303.813 1492.18 208.721 1018.09 401.427 687.27C511.26 498.717 742.237 363.89 998.232 322.509Z"
          stroke="url(#capacityCircle3Gradient)"
          strokeOpacity="0.8"
        />
        <path
          className={`${ROTATE} animate-[spin-slow-reverse_40s_linear_infinite]`}
          d="M394.682 808.041C470.695 583.381 645.84 383.681 914.218 304.898C1122.04 243.892 1302.66 259.758 1454.05 326.573C1605.44 393.393 1727.66 511.189 1818.64 654.111C2023.5 975.947 2017.44 1420.18 1601.77 1672.1C1183.53 1925.58 694.708 1773.87 469.928 1460.74C341.814 1282.27 318.665 1032.71 394.682 808.041Z"
          stroke="url(#capacityCircle2Gradient)"
          strokeOpacity="0.8"
        />
        <path
          className={`${ROTATE} animate-[spin-slow_47.5s_linear_infinite]`}
          d="M659.169 490.321C839.1 333.581 1086.27 245.206 1345.37 304.721C1546.01 350.807 1684.11 449.957 1771.68 578.977C1859.26 708.006 1896.34 866.95 1894.86 1032.66C1891.51 1405.8 1652.69 1784.04 1182.98 1803.3C710.388 1822.69 393.893 1461.03 376.503 1085.93C366.592 872.138 479.229 647.069 659.169 490.321Z"
          stroke="url(#capacityCircle1Gradient)"
          strokeOpacity="0.8"
        />
      </svg>
    </section>
  )
}
