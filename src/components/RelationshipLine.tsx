import { Relationship, Entity } from '../types/schema';

interface RelationshipLineProps {
  relationship: Relationship;
  entities: Entity[];
}

const RelationshipLine = ({ relationship, entities }: RelationshipLineProps) => {
  const fromEntity = entities.find((e) => e.id === relationship.fromEntityId);
  const toEntity = entities.find((e) => e.id === relationship.toEntityId);

  if (!fromEntity || !toEntity || !fromEntity.position || !toEntity.position) {
    return null;
  }

  // Entity card dimensions (approximate)
  const CARD_WIDTH = 300;
  const CARD_HEIGHT = 200;
  const CONNECTION_POINT_OFFSET = 20;

  // Calculate connection points on entity card edges
  const fromCenterX = fromEntity.position.x + CARD_WIDTH / 2;
  const fromCenterY = fromEntity.position.y + CARD_HEIGHT / 2;
  const toCenterX = toEntity.position.x + CARD_WIDTH / 2;
  const toCenterY = toEntity.position.y + CARD_HEIGHT / 2;

  // Calculate angle between entities
  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;
  const angle = Math.atan2(dy, dx);
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate connection points on card edges
  // Use the side of the card closest to the other entity
  const fromX = fromCenterX + (CARD_WIDTH / 2) * Math.cos(angle);
  const fromY = fromCenterY + (CARD_HEIGHT / 2) * Math.sin(angle);
  const toX = toCenterX - (CARD_WIDTH / 2) * Math.cos(angle);
  const toY = toCenterY - (CARD_HEIGHT / 2) * Math.sin(angle);

  // Create curved path for better visual appeal
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  const curvature = Math.min(distance * 0.3, 100);
  const controlX = midX - curvature * Math.sin(angle);
  const controlY = midY + curvature * Math.cos(angle);

  // Relationship type styling
  const getStrokeDashArray = () => {
    switch (relationship.type) {
      case 'one-to-one':
        return '5,5';
      case 'one-to-many':
        return 'none';
      case 'many-to-many':
        return '10,5';
      default:
        return 'none';
    }
  };

  const getColor = () => {
    switch (relationship.type) {
      case 'one-to-one':
        return '#3b82f6'; // blue
      case 'one-to-many':
        return '#10b981'; // green
      case 'many-to-many':
        return '#f59e0b'; // amber
      default:
        return '#6b7280'; // gray
    }
  };

  const getMarkerId = () => {
    switch (relationship.type) {
      case 'one-to-one':
        return 'arrowhead-one-to-one';
      case 'one-to-many':
        return 'arrowhead-one-to-many';
      case 'many-to-many':
        return 'arrowhead-many-to-many';
      default:
        return 'arrowhead-one-to-many';
    }
  };

  // Calculate label position (on the curve)
  const labelX = controlX;
  const labelY = controlY - 10;

  return (
    <g>
      {/* Curved path */}
      <path
        d={`M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`}
        stroke={getColor()}
        strokeWidth="2.5"
        strokeDasharray={getStrokeDashArray()}
        fill="none"
        markerEnd={`url(#${getMarkerId()})`}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
      />

      {/* Connection points (small circles) */}
      <circle
        cx={fromX}
        cy={fromY}
        r="4"
        fill={getColor()}
        stroke="rgba(17, 24, 39, 0.8)"
        strokeWidth="2"
      />
      <circle
        cx={toX}
        cy={toY}
        r="4"
        fill={getColor()}
        stroke="rgba(17, 24, 39, 0.8)"
        strokeWidth="2"
      />

      {/* Relationship label with background */}
      {relationship.name && (
        <g>
          <rect
            x={labelX - relationship.name.length * 3.5}
            y={labelY - 8}
            width={relationship.name.length * 7}
            height="16"
            fill="rgba(17, 24, 39, 0.9)"
            rx="4"
            stroke={getColor()}
            strokeWidth="1"
          />
          <text
            x={labelX}
            y={labelY + 2}
            fill={getColor()}
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
            className="pointer-events-none"
          >
            {relationship.name}
          </text>
        </g>
      )}
    </g>
  );
};

export default RelationshipLine;


