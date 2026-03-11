import styled from "styled-components";

export const ControlContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) 0;

  @media (max-width: 480px) {
    gap: var(--space-1);
    padding: var(--space-1) 0;
  }
`;

export const Heading = styled.h3`
  font-size: var(--text-md);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-2) 0;
  color: var(--color-text);

  @media (max-width: 480px) {
    font-size: var(--text-base);
    margin-bottom: var(--space-1);
  }
`;

export const StepperGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);

  @media (max-width: 480px) {
    gap: var(--space-1);
  }
`;

export const StepperButton = styled.button`
  background: var(--color-surface);
  color: var(--color-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  width: 44px;
  height: 44px;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background var(--duration-fast) var(--ease-default),
    color var(--duration-fast) var(--ease-default);
  cursor: pointer;
  box-shadow: var(--shadow-xs);
  outline: none;
  &:hover,
  &:focus {
    background: var(--color-primary-subtle);
    color: var(--color-primary-hover);
    border-color: var(--color-primary);
  }
  &:active {
    background: var(--color-primary-subtle);
    color: var(--color-primary);
  }
`;

export const RemoveButton = styled(StepperButton)`
  color: var(--color-danger);
  border-color: var(--color-danger);
  &:hover,
  &:focus {
    background: var(--color-danger-subtle);
    color: var(--color-danger);
    border-color: var(--color-danger);
  }
`;

export const AddButton = styled.button`
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border: none;
  border-radius: var(--radius-full);
  width: 100%;
  min-width: 120px;
  height: 44px;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--space-1);
  transition:
    background var(--duration-fast) var(--ease-default),
    color var(--duration-fast) var(--ease-default);
  cursor: pointer;
  box-shadow: var(--shadow-xs);
  outline: none;
  &:hover,
  &:focus {
    background: var(--color-primary-hover);
    color: var(--color-text-on-primary);
  }
  &:active {
    background: var(--color-primary-subtle);
    color: var(--color-primary);
  }
`;

export const RemoveFromListButton = styled(AddButton)`
  background: var(--color-danger);
  color: var(--color-text-on-primary);
  &:hover,
  &:focus {
    background: var(--color-danger-hover, #b3001b);
    color: var(--color-text-on-primary);
  }
`;

export const QtyText = styled.span`
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  min-width: 2.5em;
  text-align: center;
  color: var(--color-text);
`;

export const SubText = styled.p`
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-1) 0;
`;
