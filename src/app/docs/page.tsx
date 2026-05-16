import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Whitepapers — eulr",
  description: "eulr, SATO, and sat1 whitepapers",
};

const SAT1_WHITEPAPER = `sat1 whitepaper 1.0

A salute to SATO, and a record of what sat1 changes.

SATO proved that an issuance machine can live on ethereum without an operator, a backend, or a governance key.

§ salute

sat1 begins by saluting SATO. SATO compressed issuance, the price curve, reserve accounting, and exit flow into one immutable hook. The market had to face the code directly: no roadmap wrapper, no manual rescue path, no admin role that could rewrite the outcome later.

That minimalism deserves respect. It moved trust into bytecode and tied expectations to a public formula. sat1 keeps that spirit: promise less, keep state verifiable, and decide the hard rules before deployment.

Respect also means studying the failure mode. Once immutable code ships with a state error, the market turns the error into a rule. SATO shows how one curve can split into two accounting positions, pulling price, reserve, and graduation away from the same track.

§ what went wrong

Inside the SATO hook, two state variables became critical: ethCum, the cumulative ETH position of the curve, and totalMintedFair, the curve-accounted amount of issued supply. The buy path advanced from ethCum. The sell path and graduation check leaned on totalMintedFair.

During the early entropy phase, minted output was adjusted by a random multiplier. After that window closed, ethCum and totalMintedFair did not return to one invariant. Every later trade kept moving through two already-separated coordinates.

SATO curve:
  supply(e) = K · (1 - exp(-e / S))

observed state:
  ethCum implies a higher curve supply
  totalMintedFair records a lower issued supply

result:
  one contract, two curve positions

The drift is easy to miss because the on-chain reserve looks thicker and fees are really accumulating. The extra reserve has two sources: explicit protocol fees, and additional offset created by different buy and sell accounting. One is mechanism. The other is a state error.

§ why graduation can fail

SATO's self-deprecation condition is tied to totalMintedFair. When totalMintedFair reaches 99% of K, the curve is meant to enter deprecation. In the clean path, about 2,302 ETH of net inflow pushes issuance to that threshold.

Once drift exists, ethCum has moved too far ahead. Each later ETH mints fewer tokens. The shortfall in totalMintedFair cannot be filled by endless buying, because future mint capacity is set by the current ethCum position and trends toward zero as ethCum rises.

if ethCum is ahead:
  future mint capacity = K - supply(ethCum_now)

if totalMintedFair + future mint capacity < 0.99K:
  selfDeprecated cannot be reached through buy-only flow

Round trips make the gap worse. A user buys and then sells back. totalMintedFair mostly returns to where it started, while ethCum keeps a net increase because the sell returns less ETH than the buy put in. Remaining mint capacity shrinks again, and the graduation target moves farther away.

§ sat1 design rule

sat1 uses one rule: mint, burn, price, and graduation read the same curve position. One invariant handles issuance and exit. Auxiliary stats can be derived from it, but they cannot become a second source of state.

If the launch needs sybil resistance, bot friction, or randomness, it can affect fees, caps, waiting time, or external rewards. It cannot rewrite the main curve position. Once the main state drifts, later market activity makes the drift permanent.

Graduation also needs a reachability check. Before deployment, the contract must show that continued buying can reach the target threshold from every allowed state, and that allowed round trips cannot push the system into a region where graduation becomes unreachable.

§ how sat1 fixes the drift

SATO's deadlock comes from two states. ethCum keeps moving forward, while totalMintedFair can fall permanently behind. sat1 deletes that split. The contract stores one curve state, ethCum. Fair supply, price, sell quotes, and selfDeprecated are derived from that same position.

Fees can make the curve reserve thicker. The graduation counter remains the live curve position itself. The 99% selfDeprecated threshold stays reachable from that position, including after round trips and after the early entropy window.

sat1 invariant:
  stored state     = ethCum
  fair supply      = Curve.totalMinted(ethCum)
  price            = Curve.marginalPrice(ethCum)
  sell quote       = burnFor(Curve.totalMinted(ethCum), fairShare)
  selfDeprecated   = Curve.totalMinted(ethCum) >= 99% of K

§ fee stays in the curve

sat1 charges the same 0.3% friction on both directions. On a buy, the fee reduces the amount used for mint calculation, while the full ETH input enters the curve reserve. On a sell, the fee reduces the ETH paid out, and the withheld ETH remains in the Hook.

The fee has no recipient. It is not sent to a team, treasury, owner, or external address. It stays inside the same curve state and thickens the reserve.

buy 1.000 ETH:
  mint quote uses 0.997 ETH
  curve reserve receives 1.000 ETH

sell quote 1.000 ETH:
  seller receives 0.997 ETH
  curve reserve keeps 0.003 ETH

fee recipient:
  none

The fee can make the reserve thicker, but it does not create another accounting track. The curve still has one source of truth: ethCum.

sat1 principle:
  one curve
  one position
  one source of truth

status:
  whitepaper 1.0
  implementation live on ethereum mainnet

deployed contracts:
  token         0x8f66337a0c2A02202fd91Dd596c411CF977c6060
  hook          0x2a0A30dd78aF7698E6f40212b8B8324fcE2ee888
  router        0x9c65d15a671d814ef7bE25418fD46139E7366c07
  hook deployer 0xcbE096C140dB48199CC7e481116FD835BC33eDC6

trade at sat1. read the ancestor on-chain.`;

const SAT0_WHITEPAPER = `sato

a specter has returned to ethereum: the specter of code that runs without an operator

sato is an erc-20 on ethereum. lowercase name, lowercase symbol, eighteen decimals. it is an asset. it does not launch and graduate and migrate. there is no roadmap, no v2, no fork, no successor token. the contract that exists is the contract.

§ issuance

sato is an issuance mechanic. the contract is the issuer. there is no team treasury, no premine, no foundation allocation, no insider round. the curve is the schedule; the smart contract enforces it.

mint deposits ether into the curve's reserve pool. burn redeems against that pool. the pool grows monotonically when net mints exceed net burns. holders' exits are backed by it. no party can withdraw from it.

what miners are to bitcoin, the contract is to sato. bitcoin's issuance is gated by hash power; sato's is gated by curve price. both convert outside-system effort into inside-system supply via a transparent, verifiable rule.

§ the pool is the reserve

every mint moves ether from the buyer's wallet into the contract. the reserve only moves out via burns priced by the inverse curve. there is no admin key, no emergency function, no upgrade path. ether deposited at mint time is ether available at burn time, less protocol fees that accumulate alongside it.

this distinguishes sato from synthetic-supply tokens. there is no token without a corresponding ether deposit on-chain. the reserve is the proof.

§ curve math and its limits

issuance happens through one contract, a uniswap v4 hook, set as the only minter at deployment and locked there. the formulas below are computed on-chain in PRBMath UD60x18 fixed-point arithmetic.

minted supply at cumulative ether e:
  q(e) = K · (1 − e^(−e/S))      K = 21,000,000   S = 500 ether

price per token at position e:
  p(e) = (S / K) · e^(e/S)

ether owed for burning amount b from current supply q:
  Δe(q, b) = S · ln((K − q + b) / (K − q))

a 0.3% protocol fee is taken on each side of every mint and every burn. it stays in the hook permanently. it cannot be withdrawn, governed, voted on, or redirected. it isn't a treasury. it is a counterweight that prevents the curve from being a free thing to abuse, and prevents anyone, including us, from extracting value from it.

three constraints keep the curve hard to game. a single mint is capped at 5 ether, so no one can vacuum a meaningful share of supply in one transaction. burning in the same block as your last mint reverts, which makes flash-loan arbitrage uneconomic. and for the first hundred blocks after deployment, every mint received a random multiplier between 0.9 and 1.1: a tax on the bots tuned for the exact deployment block, costing them ten percent on average. that window has closed. from this point onward, the contract is fully deterministic.

§ deprecation

mint price grows exponentially. each new mint costs more ether than the last. eventually the marginal cost of issuance exceeds the market price and minting halts on its own. burns continue to redeem against the reserve.

the curve is asymptotic; reachable supply is bounded around 20.5 million sato and declines slightly with each burn. anything plotted past ethCum ≈ 2,302 ether is theoretical and not reachable in practice.

the curve transitions from active issuance to dormancy. the reserve persists.

§ trading regimes

during bootstrap, the curve is the only path to sato. each new buyer mints against the contract; each seller burns against it. supply expansion and price discovery happen in lockstep.

once secondary AMM pools accumulate sufficient depth, secondary becomes the primary trading venue. the curve's role narrows: canonical issuer when minting is profitable, buyer of last resort when no one bids on secondary.

this is the mature regime. the curve continues to mint supply only when secondary exceeds curve marginal — exactly the condition under which mining is profitable in bitcoin. each successful mint advances the curve, raising the cost basis for future issuance. trading at curve quote stops being the dominant market mode.

§ routing and rails

the bonding curve is a uniswap v4 pool with a hook attached. the secondary sato/usdt market is a separate v4 pool with no hook. they share the same PoolManager but they are not the same pool. a trade routes through the curve only when its pool key is selected.

most exchanges that list sato will not trade though the bonding curve. they will instead route user orders through dex aggregators (1inch, 0x, paraswap, uniswap router), which themselves call into PoolManager. aggregators that support v4 with custom hooks can discover the curve pool and quote it; most aggregators will trade on normal pools.

burning is the same. burn means "swap sato → eth through the curve pool, which decrements totalSupply against the inverse curve and pays out from the hook's reserve." this is an action on a specific pool, not a privilege of this site. any caller — this site, an aggregator, a wallet, a contract — that swaps through the curve pool will burn. any caller that swaps through the secondary sato/usdt pool will not burn; it will trade against amm liquidity, leaving total supply and the curve reserve untouched.

what this site does is route directly. when you mint or burn here, the call goes to SatoSwapRouter which targets the curve pool unconditionally. no quote-shopping, no fallback to secondary. you pay the curve price exactly.

the burn quote at any moment is:

  burn_price (eth per sato)
    = (S / (K − mintedFair))                  ← marginal inverse curve at mintedFair
    · (mintedFair / totalSupply)              ← fair-to-real supply correction
    · (1 − 0.003)                             ← protocol fee retained in reserve

the corresponding secondary quote is whatever the sato/usdt v4 pool's amm prints at the moment, less aggregator and pool fees. the two prices diverge because they answer different questions: the curve answers "what does the inverse formula owe at this position," the secondary answers "what are people willing to pay right now."

when curve burn beats secondary: when secondary bids are thin, depressed, or the pool is imbalanced toward sato, the curve's algorithmic bid can be the better exit. the curve always quotes; it doesn't run out of inventory until the reserve does.

when secondary beats curve burn: in the mature regime, when liquidity providers post tight quotes on the secondary pool, the secondary bid will usually beat the curve's. the prbmath drift between forward and inverse curve positions also widens the curve's effective spread, so the burn price is structurally below the mint price even when traded back to back. selling on secondary will usually be the better price.

how to choose: compare the "burn" quote in the trade panel to the live sato/usdt pool price shown next to it. if burn is higher, route through the curve; if secondary is higher, route through uniswap. the page links both.

we did not pre-mint. we hold no allocation, no admin role, no pause function, no upgrade path. there is nothing to extract from the hook other than by burning sato back through the inverse curve like anybody else. if everyone who shipped this disappeared tonight, the contract would run tomorrow against the same rules and the same prices. that is what we mean by "no operator." that is the only feature.

token:         0x829f4B62EEBE12Af653b4dD4fFc480966F7d7f09
hook:          0x0000f07d2B5F1Ddf3244b8780F972f306EFd2888
manager:       0x000000000004444c5dc75cB358380D2e3dE08A90
genesis block: 25,015,094

trade at sat0.org. read it on-chain.`;

const EULR_WHITEPAPER = `eulr whitepaper 1.0

An exponential launchpad on XLayer, built on the shoulders of SATO and sat1.

§ lineage

eulr begins where sat1 ends. SATO proved that an issuance machine can live on-chain without an operator, a backend, or a governance key. sat1 fixed the drift — one curve, one position, one source of truth. eulr takes that hardened invariant and extends it: not one token, but a factory. Not one deployment, but a permissionless launchpad where anyone can summon a bonding curve with a few clicks.

The lineage is direct. SATO → sat1 → eulr. Each generation keeps what the last proved and fixes what it broke. eulr inherits sat1's single-state curve design. It adds configurability, a formal graduation path, and a chain that makes the economics work for a broader set of participants.

§ what eulr is

eulr is a permissionless token launchpad on XLayer. Anyone can create an exponential bonding curve token. The creator sets a name, a symbol, a description, an optional image, and one curve parameter: S, a number between 1 and 100 that controls how steeply the price rises with each purchase. Everything else is fixed by the contract.

There is no whitelist. No curator approval. No team allocation. No admin key. The factory deploys a fresh Uniswap v4 pool with a hook attached, configured to the creator's parameters, and then steps back. From that moment, the token belongs to the market.

The creator can mint only by paying the same curve price as everyone else. The creator holds no special role. The contract cannot be upgraded. The rules are the rules.

§ the exponential curve

eulr uses the same exponential bonding curve that sat1 hardened, adapted for XLayer and denominated in OKB:

  supply(e) = K · (1 − exp(−e / S))

  K = 21,000,000 (fixed supply cap)
  S = configurable, 1 to 100 (curve steepness)

  price per token at cumulative reserve e:
  p(e) = (S / K) · exp(e / S)

  reserve needed to reach supply fraction f:
  e(f) = −S · ln(1 − f)

Lower S means a steeper curve — price rises faster, the token reaches graduation sooner, and early buyers get less supply per unit of reserve. Higher S means a flatter curve — price rises more gradually, more supply is issued before graduation, and the distribution is broader.

The creator chooses S before deployment. After deployment, S is immutable. The market then decides whether the choice was right.

Concretely: with S = 25 and a 0.3% fee, reaching 10% of max supply requires about 2.63 OKB in cumulative reserve. Reaching 80% graduation requires about 40.24 OKB. With S = 50, those numbers double to 5.27 and 80.47. With S = 10, they halve to 1.05 and 16.09. The creator picks the pace; the market decides if it was right.

eulr inherits sat1's core invariant: one curve, one position, one source of truth. The contract stores ethCum — the cumulative reserve position in OKB. Supply, price, burn quotes, and graduation status are all derived from that single variable. There is no second accounting track. The drift that split SATO's state into ethCum versus totalMintedFair cannot occur here.

§ constraints and anti-bot measures

A bonding curve launchpad is only as honest as its constraints. Without them, bots extract value faster than humans can participate. eulr applies several constraints, learned from the SATO and sat1 precedents.

First, a per-transaction mint cap prevents any single buyer from vacuuming a large share of supply in one transaction. The cap is set relative to the curve parameters at deployment and enforced by the hook.

Second, burning in the same block as your last mint reverts. This makes flash-loan arbitrage uneconomic — a bot cannot borrow OKB, mint, and immediately burn in a single atomic transaction to extract the spread. The one-block cooldown costs almost nothing for a human trader but breaks the economic logic of MEV extraction.

Third, the factory charges a flat deployment fee. This is not a revenue stream — it is a spam deterrent. A zero-cost factory would be flooded with identical tokens. The fee is small enough that a genuine creator pays it without thinking; large enough that a script deploying a thousand tokens per hour faces a real cost.

These constraints are not governance. They are not adjustable after deployment. They are code, same as the curve itself.

§ graduation and migration

SATO was a single token that lived and died on its curve. sat1 fixed the curve accounting but kept the same single-token model. eulr introduces a formal graduation event that moves tokens from the bonding curve to the open market.

When the curve reaches 80% of max supply — corresponding to a cumulative reserve of −S · ln(0.20) — the token is considered graduated. Minting is permanently closed. The curve's role shifts from active issuance to algorithmic backstop.

After graduation, the token migrates to a standard Uniswap v4 pool on XLayer. The reserve accumulated in the curve is paired with the remaining unminted supply and deployed as liquidity on the secondary market. The original bonding curve pool remains accessible for burns — the reserve is still there, the inverse curve still quotes — but the primary trading venue becomes the Uniswap pool where LPs set the price.

This is the path: bootstrap on the curve, graduate at 80%, migrate to the open market. Each phase hands more control from the algorithm to the crowd.

§ self-deprecation

eulr keeps a self-deprecation condition modeled on sat1. When the curve reaches 99% of max supply, the system enters deprecation. In practice, with graduation triggering at 80%, self-deprecation serves as a backstop — a guarantee that even if graduation is somehow skipped, the curve has a terminal state.

The reachability check is in the math. From any allowed state, continued buying can reach graduation. Round trips — buy then sell — cannot push the system into a region where graduation becomes unreachable, because the curve has one position, not two. The same invariant that sat1 proved holds here.

§ fee design

eulr charges a fee on both mint and burn. The rate is set at deployment time, typically 0.3% matching the sat0 and sat1 precedent. The fee has no recipient. It is not sent to a team wallet, a treasury, a foundation, or an external address. It stays inside the curve. It thickens the reserve.

On a buy, the fee reduces the amount used for mint calculation while the full reserve input enters the curve. On a sell, the fee reduces the output paid to the seller and the withheld amount remains in the hook.

This is not a revenue model. It is a counterweight. A zero-fee curve would be a free option to print and redeem at the contract's expense — a vulnerability that bots would drain. The fee makes the curve expensive to abuse without creating a value-extraction point for any party, including the eulr team.

buy 1.000 OKB:
  mint quote uses 0.997 OKB
  curve reserve receives 1.000 OKB

sell quote 1.000 OKB:
  seller receives 0.997 OKB
  curve reserve keeps 0.003 OKB

fee recipient:
  none

The fee can make the reserve thicker, but it does not create another accounting track. The curve still has one source of truth: ethCum.

§ permissionless creation

The heart of eulr is the factory. Any wallet can call it. The factory deploys the contracts: an ERC-20 token, a Uniswap v4 hook containing the bonding curve logic, and a pool that binds them together. The deployer pays the gas and a flat deployment fee. After deployment, the deployer has no special permissions.

Metadata — name, symbol, description, image — is signed with the creator's wallet using EIP-191 and stored off-chain. The token contract itself is minimal: a standard ERC-20 with minting rights assigned exclusively to the hook. No transfer restrictions. No blacklist. No pause function. No upgrade path.

The creator can optionally attach social links — Twitter, Telegram, a website. These are metadata, not contract state. They can be updated, but the curve parameters and the token contract cannot be changed.

§ why XLayer

eulr deploys on XLayer, not Ethereum mainnet. The choice is economic.

Ethereum makes small trades expensive. A bonding curve launchpad needs many small transactions — early mints, price discovery trades, exit burns — and on Ethereum, gas costs can consume a meaningful share of the value being created. XLayer offers the same EVM execution model with substantially lower transaction costs. The curve math is identical. The contracts are the same Solidity. The security model inherits from the underlying chain.

XLayer's native currency is OKB. The curve is priced in OKB. The reserve accumulates in OKB. The secondary pool quotes in OKB. The economics of every trade — mint fee, burn fee, gas — are denominated in a single unit of account.

Lower gas means smaller mints are economically rational. That means more participants, broader distribution, and a more organic price discovery process. The launchpad is for everyone, not just those who can afford L1 fees.

§ trading lifecycle

A token on eulr moves through three regimes.

Bootstrap: the curve is the only path to the token. Each buyer mints against the contract. Each seller burns against it. Supply and price move in lockstep. This is the same bootstrap that SATO described — the contract is the market maker, the curve is the order book.

Graduation: when the curve reaches 80% supply, minting closes. The accumulated reserve and the remaining unminted supply migrate to a Uniswap pool. The token transitions from a curve-driven asset to a market-driven asset.

Mature: the Uniswap pool becomes the primary trading venue. The curve remains as a buyer of last resort — burns still work, the reserve is still there, the inverse formula still quotes. But most volume flows through the secondary pool, where LPs compete to provide the best price.

The transition is one-way. Once graduated, a token cannot return to bootstrap. Once migrated, it cannot unmigrate. The ratchet moves forward only.

This three-regime design addresses a question SATO left open: what happens after the curve. SATO's answer was that secondary pools take over naturally once they have depth. eulr makes the transition explicit. The 80% threshold triggers a contract state change. Minting ends. Migration follows. The market receives a clear signal: this token now trades like any other.

§ routing and execution

eulr's trade execution follows the sat1 model: direct routing, no quote-shopping. When a user mints or burns through the eulr interface, the transaction targets the bonding curve pool unconditionally. The user pays the curve price exactly.

The router accepts an OKB amount and a minimum expected output (for mint) or a token amount and a minimum expected OKB return (for burn). It calls the Uniswap v4 PoolManager with the curve pool's key. The hook executes the mint or burn logic and updates ethCum. The router returns the output or reverts if the minimum is not met.

Slippage protection is built into every trade. The interface quotes from current on-chain state, applies a slippage tolerance (typically 1%), and sets that as the minimum output. If another transaction advances the curve before yours lands and the new price is worse than your minimum, the trade reverts.

The router has no special permissions — it calls public functions on public contracts. Any interface, aggregator, or wallet can do the same. eulr's router is a convenience, not a gate.

§ on-chain transparency

Every token created on eulr is fully verifiable on-chain. The curve parameters, the reserve balance, the current supply, the graduation status — all of it is readable directly from the contracts. The frontend displays what the chain contains. It does not interpolate, estimate, or invent.

The trade panel shows the live curve quote and the live secondary quote side by side. You can verify the math yourself: plug the on-chain ethCum into the supply formula, compute the marginal price, check the reserve. Everything reconciles.

This is the standard SATO set. eulr does not add off-chain pricing, hidden fees, or server-side matching. The contracts are the source of truth. The interface is a window, not an engine.

§ what eulr does not do

eulr does not curate. Any token can be created. eulr does not endorse. The interface shows the curve parameters and the on-chain state; it does not tell you what to buy. eulr does not custody. Your wallet, your keys, your signatures. The contracts are non-custodial — they hold the curve reserve, not user deposits.

eulr does not have a governance token. There is no DAO, no vote, no protocol fee switch that can be turned on later. The contracts are immutable after deployment. The frontend is open-source. The backend is a relay — it builds transactions and serves indexed data. It cannot override the contracts.

This is the same promise SATO made and sat1 kept: if everyone who shipped this disappeared tonight, the contracts would run tomorrow against the same rules and the same prices.

§ summary

eulr principle:
  one curve
  one position
  one source of truth
  many tokens
  permissionless creation
  verifiable migration

status:
  whitepaper 1.0
  implementation live on XLayer mainnet

  chain:             XLayer (chain ID 196)
  native currency:   OKB
  max supply:        21,000,000 per token
  curve type:        exponential, sat1 invariant
  curve parameter:   S ∈ [1, 100], creator-chosen
  graduation:        80% of max supply
  migration target:  Uniswap v4 on XLayer
  fee:               stays in curve, no recipient

trade at eulr. built on sat1. saluting SATO.`;

export default function DocsPage() {
  return (
    <div className="w-full font-mono bg-surface-base text-content-primary pb-24">
      {/* Sub-navigation for Docs */}
      <div className="sticky top-[64px] z-40 w-full border-b border-border bg-surface-base/80 backdrop-blur-md px-4 py-3">
        <div className="flex items-center gap-6 max-w-4xl mx-auto overflow-x-auto no-scrollbar">
          <span className="text-content-tertiary text-sm font-semibold uppercase tracking-wider mr-2 shrink-0">Contents</span>
          <a href="#eulr" className="text-sm font-medium text-accent-primary hover:text-accent-primary/80 shrink-0 transition-colors">eulr</a>
          <a href="#sat1" className="text-sm font-medium text-content-secondary hover:text-accent-primary transition-colors shrink-0">sat1</a>
          <a href="#sato" className="text-sm font-medium text-content-secondary hover:text-accent-primary transition-colors shrink-0">SATO</a>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 py-12 md:py-16 text-sm">
        <div className="space-y-24 max-w-4xl mx-auto">
          {/* eulr Whitepaper */}
          <section id="eulr" className="scroll-mt-32">
            {renderWhitepaper(EULR_WHITEPAPER, "eulr")}
            <div className="mt-12 pt-8 border-t border-border/50">
              <p className="text-content-secondary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-primary shrink-0 animate-brand-pulse"></span>
                <span>trade at <a href="/" className="text-accent-primary hover:underline font-medium">eulr</a>. built on sat1. saluting SATO.</span>
              </p>
            </div>
          </section>

          {/* sat1 Whitepaper */}
          <section id="sat1" className="scroll-mt-32 relative">
            <div className="absolute -inset-x-6 -inset-y-8 bg-surface-elevated/30 rounded-3xl -z-10 hidden md:block"></div>
            <div className="mb-10 p-4 border border-border bg-surface rounded-xl">
              <p className="text-xs text-content-tertiary leading-relaxed">
                <span className="font-semibold text-content-secondary">Note:</span> The whitepaper below is sat1&apos;s original whitepaper, reproduced in full as reference and respect.
              </p>
            </div>
            {renderWhitepaper(SAT1_WHITEPAPER, "sat1")}
            <div className="mt-10 flex items-center gap-3 text-xs text-content-tertiary">
              <a
                href="https://etherscan.io/address/0x2a0A30dd78aF7698E6f40212b8B8324fcE2ee888"
                target="_blank"
                rel="noreferrer"
                className="text-accent-primary hover:underline font-medium flex items-center gap-1"
              >
                SATO hook reference
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <span>studied with respect and caution.</span>
            </div>
          </section>

          {/* SATO Whitepaper */}
          <section id="sato" className="scroll-mt-32">
            <div className="mb-10 p-4 border border-border bg-surface rounded-xl">
              <p className="text-xs text-content-tertiary leading-relaxed">
                <span className="font-semibold text-content-secondary">Note:</span> The whitepaper below is SATO&apos;s original whitepaper from sat0.org, reproduced in full as the canonical reference for the bonding curve design that inspired sat1 and eulr.
              </p>
            </div>
            {renderWhitepaper(SAT0_WHITEPAPER, "SATO")}
            <div className="mt-10 flex items-center gap-3 text-xs text-content-tertiary">
              <a
                href="https://etherscan.io/address/0x0000f07d2B5F1Ddf3244b8780F972f306EFd2888"
                target="_blank"
                rel="noreferrer"
                className="text-accent-primary hover:underline font-medium flex items-center gap-1"
              >
                read on-chain
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <span>proof that the manifesto stored at construction matches the prose above.</span>
            </div>
          </section>

          <div className="pt-16 border-t border-border flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-3 text-content-tertiary font-mono text-sm mb-4">
              <span>SATO</span>
              <span className="text-border-hover">→</span>
              <span>sat1</span>
              <span className="text-border-hover">→</span>
              <span className="text-content-primary">eulr</span>
            </div>
            <p className="text-xs text-content-secondary tracking-widest uppercase">
              Three generations of bonding curves. One principle: code over operator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderWhitepaper(text: string, slug: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let preLines: string[] = [];
  let preKey = 0;

  function flushPre() {
    if (preLines.length > 0) {
      elements.push(
        <div key={`pre-wrapper-${slug}-${preKey}`} className="my-6">
          <pre
            className="overflow-x-auto no-scrollbar whitespace-pre rounded-xl border border-border bg-surface p-5 text-left text-[13px] text-content-secondary leading-relaxed shadow-sm"
          >
            <code className="block w-full">{preLines.join("\n")}</code>
          </pre>
        </div>
      );
      preLines = [];
      preKey++;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Blank line
    if (line.trim() === "") {
      flushPre();
      continue;
    }

    // Title (first line, no § prefix)
    if (i === 0 && !line.startsWith("§")) {
      flushPre();
      elements.push(
        <h1 key={`h1-${slug}`} className="text-3xl md:text-4xl font-bold text-content-primary mb-3 tracking-tight">
          {line}
        </h1>
      );
      continue;
    }

    // Subtitle (second line, no § prefix)
    if (i === 1 && !line.startsWith("§") && line.trim() !== "") {
      flushPre();
      elements.push(
        <p key={`sub-${slug}`} className="text-sm text-content-tertiary mb-12 uppercase tracking-widest font-semibold">
          {line}
        </p>
      );
      continue;
    }

    // Opening italic line
    if (!line.startsWith("§") && (line.startsWith("SATO proved") || line.startsWith("a specter") || line.startsWith("An exponential"))) {
      flushPre();
      elements.push(
        <p key={`italic-${slug}-${i}`} className="text-content-secondary italic text-lg leading-relaxed mb-12 border-l-2 border-accent-primary pl-4">
          {line}
        </p>
      );
      continue;
    }

    // Section headers (§ ...)
    if (line.startsWith("§ ")) {
      flushPre();
      elements.push(
        <h2 key={`h2-${slug}-${i}`} className="mt-12 mb-6 text-lg font-bold text-content-primary flex items-center gap-2 group">
          <span className="text-accent-primary opacity-50 group-hover:opacity-100 transition-opacity">§</span>
          <span>{line.substring(2)}</span>
        </h2>
      );
      continue;
    }

    // Indented code/equation lines
    if (line.startsWith("  ")) {
      preLines.push(line);
      continue;
    }

    // Lines that look like equations or code (contain =, no regular text pattern)
    if (
      line.includes("supply(e)") ||
      line.includes("p(e) =") ||
      line.includes("Δe(") ||
      line.includes("e(f) =") ||
      line.includes("burn_price") ||
      line.includes("q(e) =") ||
      line.includes("stored state") ||
      line.includes("fair supply") ||
      line.includes("sell quote") ||
      line.includes("selfDeprecated") ||
      line.includes("mint quote") ||
      line.includes("curve reserve") ||
      line.includes("seller receives") ||
      line.includes("fee recipient") ||
      line.includes("future mint") ||
      line.includes("if ethCum") ||
      line.includes("if totalMintedFair") ||
      line.includes("result:") ||
      line.includes("observed state:") ||
      line.includes("SATO curve:") ||
      line.includes("sat1 invariant:") ||
      line.includes("sat1 principle:") ||
      line.includes("eulr principle:") ||
      line.includes("one curve") ||
      line.includes("one position") ||
      line.includes("many tokens") ||
      line.includes("permissionless creation") ||
      line.includes("verifiable migration") ||
      line.includes("buy 1.000") ||
      line.includes("sell quote 1.000") ||
      line.startsWith("buy") && line.includes("OKB") ||
      line.startsWith("sell") && line.includes("OKB")
    ) {
      preLines.push(line);
      continue;
    }

    // Regular paragraph
    flushPre();
    elements.push(
      <p key={`p-${slug}-${i}`} className="mb-5 text-[15px] text-content-secondary leading-[1.75]">
        {line}
      </p>
    );
  }

  flushPre();

  return <div className="space-y-0">{elements}</div>;
}