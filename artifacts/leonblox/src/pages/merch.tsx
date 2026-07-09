import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  link: string | null;
  available: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: "hoodie",
    name: "HOODIE",
    description: "Premium heavyweight hoodie.",
    price: "$60",
    image: "https://imgproxy.fourthwall.dev/Wm-1pj0DqGXTJgwZddYXczQfqOYnaHS4G62ckuze8I0/w:1200/sm:1/enc/3HQA4yFjY-LBXfx7/BrFtF3DNhO-Xlnc5/tw7GBtDpLszCrM6l/N1v1Ij2dCvV3ZzQJ/s54qBo0or0S-K-jI/8Y8egsow8FoQFQ_Y/ACyX4CwYByNlLnsX/OvOM9wzeQVsgrQs5/pc31i6c7urQlIIlF/HLteGpvx1IXC1jda/dHPfDldupn4Tj2yR/V7pR18ArjXZ78ir3/LAfc5XJOrL068gOy/H8Wmi00GAGraGjzz/oyXc-aVmHjc.png",
    link: "https://leonbloxofficial-shop.fourthwall.com/products/leonblox-hoodie",
    available: true,
  },
  {
    id: "zip-hoodie",
    name: "ZIP UP HOODIE",
    description: "Full-zip heavyweight hoodie.",
    price: "$45",
    image: "https://imgproxy.fourthwall.dev/BY2M1aeyX51cDWE4lm2zCKu_VBZ9T9jqvlA2lDbE8gc/w:1200/sm:1/enc/vpknip1qpC1lYWmx/exjCJ4sTFaD3Hn0J/Vxp5yfdb3YHJn39G/8IBCPG8uMlwyn9sU/J3ylF2qGEUTWo_Wu/aseC3Qy_UyhkkIGb/3YY4VxcWFU2xk9cS/8mSVFyiiNy-LUQtK/ge8WrETG_JlzwlhO/aAJG0xJ6U2ITynIr/6v0pEp9AwZ3LmNxv/DAoIMOiLU_iwZK0Y/nIJgUOEzQKURKnn-/WlKTC_HLygaqsdWn/_E1Oesfu65U.png",
    link: "https://leonbloxofficial-shop.fourthwall.com/products/leonblox-adult-zip-up-hoodie",
    available: true,
  },
  {
    id: "tshirt",
    name: "SOFT T-SHIRT",
    description: "Classic soft fit tee.",
    price: "$27",
    image: "https://imgproxy.fourthwall.dev/a1PrrqnXXvTfTUY01YtYlnRDNAIeTW-TxfEeTREy9No/w:1200/sm:1/enc/-rG0Xt50xPDp5W-3/Q_mcOp02o4M4jU0_/5H0501ON2mMv26lp/9rkhlK3c8qOlmxPA/6EGnr2wBLqUouBkO/Q6YnC1zyVCG4XEbf/JkxzDFLBpHFgGdue/qi1W9aP6sJsabcBA/28zW5vTDkgfoqoyh/Yan6pYNriNlfPSUS/xaSSt1IEIVAXZDWk/KHlby9VPFYA-P0XD/yhKowSGLwYWdY0WM/_d_8KOpiE5liaVAe/493B0-4FFAw.png",
    link: "https://leonbloxofficial-shop.fourthwall.com/products/leonblox-adult-soft-tee",
    available: true,
  },
  {
    id: "wool-snapback",
    name: "WOOL SNAPBACK",
    description: "Classic wool snapback cap.",
    price: "$30",
    image: "https://imgproxy.fourthwall.dev/tJwLUiVZvrP0a7jdMj03K28Fw9t6jTSdQ6o_mTAUWpw/w:1200/sm:1/enc/YoeCvIkpa1GCWQ9Z/WZUL3EzxoKhWKFzM/JWHDWyWhfNFXRwOt/Yo32hIh-liBb4WfA/b8uxCW024LEkk9eG/ioBtdiCSRwxCT0pf/DeY9iuEfqNnPTgu3/c0IamOaFJIF8P6kZ/uxTs8q8KtiXAun2A/UD0peaZLvpyy6k0z/8zXYtA8pkJpdScqt/_LE4gmv4Ey3BCMBq/7dcJxdehH4nWZ4bP/EXUNi2bsGOzGmDwq/UESgguOi_aQ.png",
    link: "https://leonbloxofficial-shop.fourthwall.com/products/leonblox-wool-snapback",
    available: true,
  },
  {
    id: "bucket-hat",
    name: "BUCKET HAT",
    description: "Relaxed fit bucket hat.",
    price: "$25",
    image: "https://imgproxy.fourthwall.dev/2FhoXeZ8HmGAw0ehvCDIwb7oj3JphfUaQUXwvgDrRUw/w:1200/sm:1/enc/4TiDBb_ANMnRtOQh/A1G1ouDs_e5PIoGi/vnyZ8vkaFEVBySny/Zb0M8wxVPKuW0-bU/UTzQajEvJDdow3GB/tBsVCsDd1F1kwfgg/o5G73IXr63Hwun_m/6QUMeXfZ68DhlKi4/Z15p1hdqx__esUzJ/0YTtxHeQq9Hp-xTJ/N5R2madUrMyPSj3G/mpMrkC_g3DSRBgsc/HNL5LXY_hfB0t-DT/WY4z0behue5ffXpk/D73_nDRcb_Q.png",
    link: "https://leonbloxofficial-shop.fourthwall.com/products/leonblox-bucket-hat",
    available: true,
  },
  {
    id: "rope-hat",
    name: "ROPE HAT",
    description: "Structured rope trucker hat.",
    price: "$25",
    image: "https://imgproxy.fourthwall.dev/Ndh4knp4s8jbuEC8kQdNcpvfVX5SIuPQSCxlgCiBhV8/w:1200/sm:1/enc/jN2uQG5lx_mLYxom/qcW5dKA0oa4yseFy/i8gr8_rI7MeZzQZ6/qXP1pwaMb_2iMMWh/f17kuAoI8q3D-_Vt/WWWbHuz0ra9YCBMX/Rt50BER4JTcP8arP/gG6N12AF_PlQCEhv/4uWtLmPB86Zq2E9u/Z3HDpezXKzBzMklZ/mfzkC6L_cizO4rPV/Tp9jgm2UaDw5LWgg/YcLSYEujgxV7ShAo/OoqqpqR-eqziI6L4/CoRPdLYG7HU.png",
    link: "https://leonbloxofficial-shop.fourthwall.com/products/leonblox-rope-hat",
    available: true,
  },
  {
    id: "water-bottle",
    name: "WATER BOTTLE",
    description: "Stainless steel insulated bottle.",
    price: "$28",
    image: "https://imgproxy.fourthwall.dev/XBhlEfQTHE7vieY4Ciitc5Q1gZl6TCfGWzkdp4DE5-Q/w:1200/sm:1/enc/oq4yPxNVrLGC0cgp/X0tlm_5tAYM0ubg-/4wVfLKT0dE6n9grc/r4lYZCyAbT534jMD/ffmH82fsARookIsP/1oRnvB_igw9jPikm/jWo1snQp3Pwd1MWL/GvtSko9YVAT6TQCN/srbABudqRAP-Wfal/XRfoRrlF0E6DKY5H/QEfUmDP8gYo8oMci/pF8HMBERhlWQfgQi/dsx_14bfZx20ZD4y/La5OdJL9o_83yE0w/849TeGWDSuo.png",
    link: "https://leonbloxofficial-shop.fourthwall.com/products/leonblox-stainless-water-bottle",
    available: true,
  },
  {
    id: "mug",
    name: "MUG",
    description: "Ceramic coffee mug.",
    price: "From $15",
    image: "https://imgproxy.fourthwall.dev/V95aT7xpEEM-qKoDJJvbQwfOxwhN79xuU1aGR5C-UQ0/w:1200/sm:1/enc/EXKvR1U8uWL6txcW/nsIyAVlzcdglFkKv/z9jf1IvFg_aVacFQ/HlFnkVNagEq0CJmW/FLMTaY7gc4LDXPlg/erPO9U-e2ghFFJt_/BTeHiIopPXZe6AjP/PKwU-kISNHXqEq3d/TutQTwVg9STOjw7-/cZJrlMHh1TczO0lj/0FjXMSJLQxVN0FM8/WIZVr0R9pe29UVDj/qqlUr1Eopsn5FUfe/uPsoMozZykgHjS3R/hObv1UqAnFg.png",
    link: "https://leonbloxofficial-shop.fourthwall.com/products/leonblox-mug",
    available: true,
  },
  {
    id: "sticker",
    name: "STICKER",
    description: "Die-cut vinyl sticker.",
    price: "$6",
    image: "https://imgproxy.fourthwall.dev/UmzPiiAXWa7-vHZUh6t1yZBvb-zqEWBW4t8ypXjLzfM/w:1200/sm:1/enc/5h8T94sJgK7geWiW/iSLIkPkOUGRjpUKp/WNpKr10upnBdtSTj/coa96Pu4cW_Tf4eJ/9PrghT06kZV-Hpww/QUsWK5b1ZHjqrScM/2SQ1sUZHTMtRfRvg/WiBDNRSOuZ5sLbUo/Yy34vGpF-nwAhfXi/zVYvg4P_egoU4i7C/Cg7ET5PRs24cF4XT/ZUD27AROs7P-R4aA/p7D8YK6IWXGcUVKp/FRXtS3rBSW2Iu8oy/bzzAshSqMHI.png",
    link: "https://leonbloxofficial-shop.fourthwall.com/products/leonblox-sticker",
    available: true,
  },
  {
    id: "holo-sticker",
    name: "HOLOGRAPHIC STICKER",
    description: "Premium holographic sticker.",
    price: "$10",
    image: "https://imgproxy.fourthwall.dev/v1r7bDdGw3OHqzetwo2Dj3NbOUnk49U7wMAUTrQ1Fnw/w:1200/sm:1/enc/8GRQbcrJiKEEZHaY/xlNSm4UAs7HTGXlB/mKfSmW4iiX4kjSSV/baYFKnzbgqR09X-l/5GluWkR-AN13zp-U/qIpQbRgIJlrbZlq2/mqjrqsmtlaSFLMXz/QJuoH_qQjj0EtLps/WeZtE66kTsUIrwk1/6ce8evAN1MFeIIHk/uo9zwfnK_iynrXTg/7k9Z04M3a2ljB1Fc/LbM0MiPp0tOKeFVc/0_2kFU3Xlrj493cK/gvaUo74w5hg.png",
    link: "https://leonbloxofficial-shop.fourthwall.com/products/leonblox-holographic-sticker",
    available: true,
  },
  {
    id: "desk-mat",
    name: "DESK MAT",
    description: "Large gaming desk mat.",
    price: "$20",
    image: "https://imgproxy.fourthwall.dev/aqB-jHydl6X3l0IVJSdNVKOyIVpfIYhIRAoQ_Uf3I1s/w:1200/sm:1/enc/hUI-mqt3BNkkfrH-/ZKe5ET9KuG3lW17L/xZrWgbbcPTDyaKMq/gslY2V5C1Uf8f4_4/wua6sA3v_GdCjgcd/uDfIF6apRSfd4Eih/aWgBWCqDgutq5hEI/a6q07F8p0qTgC_4o/_18vFJO3QE8OLCoy/B16-hqdmH7gE4yK5/uk3p2RksdxhzAwkq/ePMWTxP6dlN4Puul/JcMecfPCTrgqMEAT/VgpuePRHH7pg5l2g/mkVuCuzWC0w.png",
    link: "https://leonbloxofficial-shop.fourthwall.com/products/leonblox-desk-mat",
    available: true,
  },
  {
    id: "mouse-pad",
    name: "MOUSE PAD",
    description: "Precision gaming mousepad.",
    price: "$15",
    image: "https://imgproxy.fourthwall.dev/p5bYcX21LDCde7IktFW-U0BNShNdxBJr-iHSJdtTMt0/w:1200/sm:1/enc/FbO3xUQ-Cnj4uPmv/tsvQQ3VotYO9TWCX/66-3QuNhxUUNqDra/IE-2sRVlEokQ5oPW/d5NR9Ag0vUAOcDvp/saGrnKINWsQJg70b/V8d7JZc33Temn26m/piMCRUsYvhPCub7w/0hZZxm9dYSAfuqPr/DQWfWKjBth8WinWn/q7sgxs6bF3lLLwtP/9uMkOUNTTTysTbvk/_w4EaO8nYv6wKgAh/W0OntdqZ3goFrCEG/Jhi1hFZV01g.png",
    link: "https://leonbloxofficial-shop.fourthwall.com/products/leonblox-mouse-pad",
    available: true,
  },
  {
    id: "iphone-case",
    name: "iPhone CASE",
    description: "Tough iPhone case.",
    price: "$20",
    image: "https://imgproxy.fourthwall.dev/q1xxltbm5RNjsHdUQ8JtIqG2JRpv4SYtVB6DNj7sHT4/w:1200/sm:1/enc/Q69oZ8x-g4olj4Cs/b0JvI0vsQzeFLJoz/javqhX5jczzfetj8/Mxj01TSOuqTLjh8n/nCTT-hYNwpvdHJaM/tPZKxYwhM1mrr08x/E5gT-Azy4EgzQ_XB/PfBiNxcpezFXbmCc/2Uqcz4cJ_8NY_g-w/vtbofJshxr3HUoTE/8ebIsunOfstwVVap/RhPYiOqiy67VX_XJ/mdZCkttlbt7F4XJa/CzvrDUmPd31yJpL3/DInyOMDzeDM.png",
    link: "https://leonbloxofficial-shop.fourthwall.com/products/leonblox-iphone-case",
    available: true,
  },
];

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative bg-card border border-border hover:border-primary transition-all duration-300 flex flex-col"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-background/60 overflow-hidden flex items-center justify-center">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground/30">
            <ShoppingBag className="w-16 h-16" />
            <span className="font-display text-xs tracking-widest">COMING SOON</span>
          </div>
        )}
        {/* Glow on hover */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300 pointer-events-none" />
      </div>

      {/* Info */}
      <div className="p-6 flex flex-col gap-3 flex-1">
        <h3 className="font-display font-bold text-lg tracking-widest text-foreground">{product.name}</h3>
        <p className="text-muted-foreground text-sm font-mono flex-1">{product.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-display font-bold text-primary tracking-widest">{product.price}</span>
          {product.available && product.link ? (
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-black font-display font-bold tracking-widest text-xs px-5 py-2 hover:bg-primary/80 transition-colors shadow-[0_0_10px_rgba(0,255,255,0.3)]"
            >
              BUY NOW
            </a>
          ) : (
            <span className="font-display text-xs tracking-widest text-muted-foreground/50 border border-border px-4 py-2">
              NOTIFY ME
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Merch() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* Header */}
      <section className="pt-40 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-display font-bold text-5xl md:text-7xl tracking-widest text-foreground mb-6">
            LEON<span className="text-primary">BLOX</span> MERCH
          </h1>
          <p className="text-muted-foreground font-mono max-w-md mx-auto text-sm leading-relaxed">
            Official LeonBlox gear. Grab yours now.
          </p>
        </motion.div>
      </section>

      {/* Products grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* More coming */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-6 border border-dashed border-border/50 flex items-center justify-center py-16 text-muted-foreground/30"
        >
          <span className="font-display tracking-widest text-sm">MORE DROPPING SOON...</span>
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}
