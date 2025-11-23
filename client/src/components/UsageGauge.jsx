function UsageGauge({ totalPower, deviceCount, isHighUsage }) {
  const dailyCost = ((totalPower / 1000) * 24 * 0.12).toFixed(2)
  const activeDevices = deviceCount
  const isOverload = totalPower > 800

  return (
    <>
      <div className={`gauge-value ${isHighUsage ? 'high-usage' : ''}`}>
        {totalPower.toFixed(1)}W
      </div>
      {isOverload && (
        <div className="overload-warning">
          ⚠️ OVERLOAD! ⚠️
        </div>
      )}
      <div className="gauge-label">
        💰 ${dailyCost}/day estimated
      </div>
      <div className="gauge-label">
        🔌 {activeDevices} devices monitored
      </div>
    </>
  )
}

export default UsageGauge
