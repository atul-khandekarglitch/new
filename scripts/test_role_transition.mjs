import assert from 'node:assert';
import fs from 'node:fs';

console.log('🧪 Starting Induscycle Role Transition & Animation Test Suite...\n');

let passedTests = 0;
let failedTests = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    failedTests++;
  }
}

async function itAsync(description, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    failedTests++;
  }
}

// 1. Check AuthContext Implementation
it('AuthContext contains role transition state and 2-phase timing (~300ms total)', () => {
  const authCode = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');
  assert(authCode.includes('isRoleTransitioning'), 'Should declare isRoleTransitioning state');
  assert(authCode.includes('roleTransitionStage'), 'Should declare roleTransitionStage state');
  assert(authCode.includes('roleTransitionDirection'), 'Should declare roleTransitionDirection state');
  assert(authCode.includes('roleTransitionError'), 'Should declare roleTransitionError state');
  assert(authCode.includes('targetRole'), 'Should declare targetRole state');
  assert(authCode.includes('if (isRoleTransitioning)'), 'Should debounce and guard against rapid repeated clicks');
  assert(authCode.includes('fading_out'), 'Should have fading_out phase');
  assert(authCode.includes('fading_in'), 'Should have fading_in phase');
  assert(authCode.includes('140'), 'Phase 1 duration should be ~140ms');
  assert(authCode.includes('160'), 'Phase 2 duration should be ~160ms');
  assert(authCode.includes('setRoleTransitionError'), 'Should handle failure state and restore previous role');
});

// 2. Check Navbar Role Switcher Implementation
it('Navbar has animated sliding pill indicator and loading spinner states', () => {
  const navbarCode = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
  assert(navbarCode.includes('role-indicator-pill'), 'Navbar should render role-indicator-pill element');
  assert(navbarCode.includes('transition-all duration-300 ease-out'), 'Indicator should have 300ms smooth transition');
  assert(navbarCode.includes('bg-brand-purple'), 'Should highlight seller role with brand purple');
  assert(navbarCode.includes('bg-brand-blue'), 'Should highlight buyer role with brand blue');
  assert(navbarCode.includes('bg-emerald-600'), 'Should highlight dual role with emerald');
  assert(navbarCode.includes('Loader2'), 'Should render Loader2 spinner during transitions');
  assert(navbarCode.includes('disabled={isRoleTransitioning}'), 'Buttons should be disabled while transitioning to prevent race conditions');
  assert(navbarCode.includes('roleTransitionError'), 'Navbar should render error notification banner on failure');
});

// 3. Check RoleTransitionWrapper
it('RoleTransitionWrapper implements fade and subtle horizontal slide with reduced motion accessibility', () => {
  const wrapperCode = fs.readFileSync('src/components/RoleTransitionWrapper.tsx', 'utf8');
  assert(wrapperCode.includes('roleTransitionStage'), 'Should use roleTransitionStage');
  assert(wrapperCode.includes('roleTransitionDirection'), 'Should use roleTransitionDirection for horizontal slide');
  assert(wrapperCode.includes('translate-x-3') || wrapperCode.includes('-translate-x-3'), 'Should include subtle horizontal slide offset');
  assert(wrapperCode.includes('motion-reduce:transition-opacity'), 'Should respect reduced motion preference');
  assert(wrapperCode.includes('motion-reduce:transform-none'), 'Should disable slide transforms under reduced motion');
});

// 4. Check CSS & Reduced Motion Tokens in globals.css
it('globals.css defines prefers-reduced-motion media query for role transitions', () => {
  const cssCode = fs.readFileSync('src/app/globals.css', 'utf8');
  assert(cssCode.includes('prefers-reduced-motion: reduce'), 'Should include prefers-reduced-motion media query');
  assert(cssCode.includes('.role-indicator-pill'), 'Should define rule for .role-indicator-pill');
  assert(cssCode.includes('.role-transition-element'), 'Should define rule for .role-transition-element');
});

// 5. Check Buyer and Seller Dashboard Wrappers
it('Buyer and Seller dashboards wrap role-specific views in RoleTransitionWrapper', () => {
  const buyerCode = fs.readFileSync('src/app/dashboard/buyer/page.tsx', 'utf8');
  const sellerCode = fs.readFileSync('src/app/dashboard/seller/page.tsx', 'utf8');
  assert(buyerCode.includes('<RoleTransitionWrapper'), 'Buyer dashboard must wrap content in RoleTransitionWrapper');
  assert(sellerCode.includes('<RoleTransitionWrapper'), 'Seller dashboard must wrap content in RoleTransitionWrapper');
  assert(buyerCode.includes('router.push("/dashboard/seller")'), 'Buyer dashboard smoothly navigates to seller dashboard when role switches');
  assert(sellerCode.includes('router.push("/dashboard/buyer")'), 'Seller dashboard smoothly navigates to buyer dashboard when role switches');
});

// 6. Test Live Server Role API Switch Calls
await itAsync('POST /api/auth switches to buyer role and returns correct profile', async () => {
  const res = await fetch('http://localhost:3000/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', role: 'buyer' }),
  });
  assert.strictEqual(res.status, 200, 'Should respond with 200 OK');
  const data = await res.json();
  assert(data.success, 'Response should have success: true');
  assert.strictEqual(data.user.role, 'buyer', 'User role should be buyer');
  assert(data.user.name.includes('Rajesh'), 'User should be Rajesh Sharma');
  assert(data.company.name.includes('Kalyani'), 'Company should be Kalyani Heavy Fab');
});

await itAsync('POST /api/auth switches to seller role and returns correct profile', async () => {
  const res = await fetch('http://localhost:3000/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', role: 'seller' }),
  });
  assert.strictEqual(res.status, 200, 'Should respond with 200 OK');
  const data = await res.json();
  assert(data.success, 'Response should have success: true');
  assert.strictEqual(data.user.role, 'seller', 'User role should be seller');
  assert(data.user.name.includes('Anand'), 'User should be Anand Verma');
  assert(data.company.name.includes('Apex'), 'Company should be Apex Aerospace');
});

await itAsync('POST /api/auth switches to dual (both) role and returns correct profile', async () => {
  const res = await fetch('http://localhost:3000/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', role: 'both' }),
  });
  assert.strictEqual(res.status, 200, 'Should respond with 200 OK');
  const data = await res.json();
  assert(data.success, 'Response should have success: true');
  assert.strictEqual(data.user.role, 'both', 'User role should be both');
  assert(data.user.name.includes('Vikram'), 'User should be Vikram Patel');
});

// Summary
console.log('\n=========================================');
console.log(`Results: ${passedTests} passed, ${failedTests} failed`);
console.log('=========================================\n');

if (failedTests > 0) {
  process.exit(1);
}
