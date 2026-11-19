import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCutawaySeparation,
  computeSphereKinematics,
  dampValue,
} from './sphereKinematics';
import {
  getContactHref,
  isPlaceholderValue,
  validateImageConfig,
  validateLabPrompt,
} from './portfolioUtils';
import { PORTFOLIO_CONFIG } from '../data/portfolioConfig';

test('isPlaceholderValue detects [ADD ...] placeholders and accepts real values', () => {
  assert.equal(isPlaceholderValue('[ADD YOUR NAME]'), true);
  assert.equal(isPlaceholderValue('[ADD EMAIL]'), true);
  assert.equal(isPlaceholderValue('   '), true);
  assert.equal(isPlaceholderValue('hello@example.com'), false);
  assert.equal(isPlaceholderValue('https://github.com/engineer'), false);
});

test('getContactHref suppresses broken links for placeholders and formats real destinations', () => {
  assert.equal(
    getContactHref({ id: 'email', label: 'Email', value: '[ADD EMAIL]', kind: 'email' }),
    null,
  );
  assert.equal(
    getContactHref({ id: 'email', label: 'Email', value: 'me@domain.com', kind: 'email' }),
    'mailto:me@domain.com',
  );
  assert.equal(
    getContactHref({ id: 'github', label: 'GitHub', value: 'github.com/me', kind: 'url' }),
    'https://github.com/me',
  );
  assert.equal(
    getContactHref({
      id: 'linkedin',
      label: 'LinkedIn',
      value: 'https://linkedin.com/in/me',
      kind: 'url',
    }),
    'https://linkedin.com/in/me',
  );
});

test('computeSphereKinematics produces bounded angles and respects reducedMotion', () => {
  const active = computeSphereKinematics({
    elapsedSeconds: 2.5,
    scrollProgress: 0.5,
    pointerX: 0.8,
    pointerY: -0.4,
    reducedMotion: false,
  });
  assert.equal(Number.isFinite(active.pendulumSwingZ), true);
  assert.equal(Number.isFinite(active.shellYawY), true);
  assert.equal(Math.abs(active.pendulumSwingZ) < 1.2, true);

  const reduced = computeSphereKinematics({
    elapsedSeconds: 10,
    scrollProgress: 0,
    pointerX: 1,
    pointerY: 1,
    reducedMotion: true,
  });
  assert.equal(reduced.shellPitchX, 0.18);
  assert.equal(reduced.pendulumSwingZ, 0.22);
});

test('dampValue and cutaway separation converge smoothly toward target', () => {
  const next = dampValue(0, 1, 6, 0.016);
  assert.equal(next > 0 && next < 0.2, true);

  const sepOpen = computeCutawaySeparation(true, 0, 0.05);
  assert.equal(sepOpen > 0 && sepOpen < 0.44, true);

  const sepClosed = computeCutawaySeparation(false, 0.44, 0.05);
  assert.equal(sepClosed < 0.44 && sepClosed >= 0, true);
});

test('studio lab validation checks prompts, sizes, and aspect ratios', () => {
  assert.equal(validateLabPrompt('').valid, false);
  assert.equal(validateLabPrompt('ok').valid, false);
  assert.equal(validateLabPrompt('Explain PID damping on a line follower').valid, true);

  assert.equal(
    validateImageConfig('4K', '21:9', 'gemini-3-pro-image-preview').valid,
    true,
  );
  assert.equal(
    validateImageConfig('2K', '16:9', 'gemini-nano-banana-2.1').valid,
    true,
  );
  assert.equal(
    validateImageConfig('8K', '16:9', 'gemini-3-pro-image-preview').valid,
    false,
  );
  assert.equal(
    validateImageConfig('1K', '5:7', 'gemini-3-pro-image-preview').valid,
    false,
  );
});

test('PORTFOLIO_CONFIG preserves required factual entries without fabricating extras', () => {
  assert.equal(PORTFOLIO_CONFIG.sections.projects.items.length, 3);
  assert.equal(PORTFOLIO_CONFIG.sections.ideas.items.length, 2);
  assert.equal(PORTFOLIO_CONFIG.sections.notes.items.length, 3);
  assert.equal(PORTFOLIO_CONFIG.sections.path.milestones.length, 3);
  assert.equal(PORTFOLIO_CONFIG.sections.contact.links.length, 3);
});
