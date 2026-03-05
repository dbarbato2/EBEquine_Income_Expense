import React, { useState } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { plus, x } from '../../utils/Icons';

const TripCostCalculator = () => {
  const [tripDetails, setTripDetails] = useState({
    hotelCostPerNight: '',
    flightCost: '',
    checkedBags: '0',
    departureDateDate: null,
    departureTime: '9',
    returnDate: null,
    returnTime: '9',
    airportTransportation: 'Logan Express',
    numberOfHorses: '',
    numberOfBarns: ''
  });

  const [expandedTable, setExpandedTable] = useState(null);
  const [showProfitResult, setShowProfitResult] = useState(false);
  const [calculatedProfit, setCalculatedProfit] = useState(0);
  const [quarterlyIncome, setQuarterlyIncome] = useState({
    darrel: 225000,
    erin: 50000,
    bonus: 70000
  });

  const [federalTaxRates, setFederalTaxRates] = useState([
    { taxRate: 10, fromAmount: 0, toAmount: 23850 },
    { taxRate: 12, fromAmount: 23851, toAmount: 96950 },
    { taxRate: 22, fromAmount: 96951, toAmount: 206700 },
    { taxRate: 24, fromAmount: 206701, toAmount: 394600 },
    { taxRate: 32, fromAmount: 394601, toAmount: 501050 },
    { taxRate: 35, fromAmount: 501051, toAmount: 751600 },
    { taxRate: 37, fromAmount: 751601, toAmount: null }
  ]);

  const [assumptions, setAssumptions] = useState({
    breakfastMealCost: 15,
    lunchMealCost: 20,
    dinnerMealCost: 25,
    dailyRentalCarCost: 60,
    baggageFePerFlight: 35,
    flightLength: 2.5,
    tollCost: 6,
    gasCost: 10,
    loganExpressParkingPerDay: 7,
    loganExpressRoundTripTicket: 18,
    airportParkingReservedEconomyPerDay: 25,
    airportParkingEconomyPerDay: 32,
    airportParkingCentralPerDay: 41,
    massageFee: 125,
    travelFeePerBarn: 30
  });

  const handleInputChange = (field) => (e) => {
    setTripDetails({
      ...tripDetails,
      [field]: e.target.value
    });
  };

  const handleDateChange = (field) => (date) => {
    setTripDetails({
      ...tripDetails,
      [field]: date
    });
  };

  const handleQuarterlyIncomeChange = (field) => (e) => {
    setQuarterlyIncome({
      ...quarterlyIncome,
      [field]: parseFloat(e.target.value) || 0
    });
  };

  const handleFederalTaxRateChange = (index, field) => (e) => {
    const updatedRates = [...federalTaxRates];
    const value = field === 'taxRate' ? parseFloat(e.target.value) || 0 : (e.target.value === '' ? null : parseFloat(e.target.value) || 0);
    updatedRates[index] = {
      ...updatedRates[index],
      [field]: value
    };
    setFederalTaxRates(updatedRates);
  };

  const handleAssumptionsChange = (field) => (e) => {
    setAssumptions({
      ...assumptions,
      [field]: parseFloat(e.target.value) || 0
    });
  };

  const toggleTable = (tableName) => {
    setExpandedTable(expandedTable === tableName ? null : tableName);
  };

  const calculateCumulativeIncome = (quarter) => {
    const quarterlyAmount = (quarterlyIncome.darrel + quarterlyIncome.erin) / 4;
    let cumulative = 0;

    for (let q = 1; q <= quarter; q++) {
      if (q === 1) {
        cumulative = quarterlyAmount + quarterlyIncome.bonus;
      } else {
        cumulative += quarterlyAmount;
      }
    }

    return cumulative;
  };

  const calculateTaxOnIncome = (income) => {
    let tax = 0;

    for (const bracket of federalTaxRates) {
      // Skip 0% tax brackets
      if (bracket.taxRate === 0) continue;

      const rate = bracket.taxRate / 100;
      let taxableInThisBracket = 0;

      if (income < bracket.fromAmount) {
        // Income hasn't reached this bracket yet
        break;
      } else if (bracket.toAmount === null) {
        // Highest bracket (no upper limit)
        taxableInThisBracket = income - bracket.fromAmount;
      } else if (income >= bracket.toAmount) {
        // Income exceeds this bracket
        taxableInThisBracket = bracket.toAmount - bracket.fromAmount + 1;
      } else {
        // Income falls within this bracket
        taxableInThisBracket = income - bracket.fromAmount;
      }

      if (taxableInThisBracket > 0) {
        tax += taxableInThisBracket * rate;
      }
    }

    return tax;
  };

  const calculateEffectiveTaxRate = (income) => {
    if (income <= 0) return 0;
    const tax = calculateTaxOnIncome(income);
    return (tax / income) * 100;
  };

  const calculateHotelNights = () => {
    if (!tripDetails.departureDateDate || !tripDetails.returnDate) return 0;
    const oneDay = 24 * 60 * 60 * 1000;
    const diffInDays = Math.round((tripDetails.returnDate - tripDetails.departureDateDate) / oneDay);
    return diffInDays;
  };

  const calculateTripHours = () => {
    if (!tripDetails.departureDateDate || !tripDetails.returnDate) return 0;

    // Create departure datetime
    const departureDateTime = new Date(tripDetails.departureDateDate);
    departureDateTime.setHours(parseInt(tripDetails.departureTime), 0, 0, 0);

    // Create return datetime
    const returnDateTime = new Date(tripDetails.returnDate);
    returnDateTime.setHours(parseInt(tripDetails.returnTime), 0, 0, 0);

    // Calculate difference in hours
    const diffInMs = returnDateTime - departureDateTime;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    return Math.round(diffInHours);
  };

  const calculateBreakfastCost = () => {
    const hotelNights = calculateHotelNights();
    const departureHour = parseInt(tripDetails.departureTime);
    
    if (departureHour >= 12) {
      // After noon: hotel nights × breakfast cost
      return hotelNights * assumptions.breakfastMealCost;
    } else {
      // Before noon: (hotel nights + 1) × breakfast cost
      return (hotelNights + 1) * assumptions.breakfastMealCost;
    }
  };

  const calculateLunchCost = () => {
    const hotelNights = calculateHotelNights();
    const departureHour = parseInt(tripDetails.departureTime);
    const returnHour = parseInt(tripDetails.returnTime);

    if (departureHour >= 16 && returnHour < 12) {
      // After 4 PM departure AND before noon return: (hotel nights - 1) × lunch cost
      return (hotelNights - 1) * assumptions.lunchMealCost;
    } else if (departureHour >= 16 || returnHour < 12) {
      // After 4 PM departure OR before noon return: hotel nights × lunch cost
      return hotelNights * assumptions.lunchMealCost;
    } else {
      // Otherwise: (hotel nights + 1) × lunch cost
      return (hotelNights + 1) * assumptions.lunchMealCost;
    }
  };

  const calculateDinnerCost = () => {
    const hotelNights = calculateHotelNights();
    const departureHour = parseInt(tripDetails.departureTime);
    const returnHour = parseInt(tripDetails.returnTime);

    if (departureHour >= 20 && returnHour < 17) {
      // After 8 PM departure AND before 5 PM return: (hotel nights - 1) × dinner cost
      return (hotelNights - 1) * assumptions.dinnerMealCost;
    } else if (departureHour >= 20 || returnHour < 17) {
      // After 8 PM departure OR before 5 PM return: hotel nights × dinner cost
      return hotelNights * assumptions.dinnerMealCost;
    } else {
      // Otherwise: (hotel nights + 1) × dinner cost
      return (hotelNights + 1) * assumptions.dinnerMealCost;
    }
  };

  const calculateTotalFlightCost = () => {
    const baggageCost = parseInt(tripDetails.checkedBags) * assumptions.baggageFePerFlight * 2;
    const basFlightCost = parseFloat(tripDetails.flightCost) || 0;
    return baggageCost + basFlightCost;
  };

  const calculateHotelCost = () => {
    const hotelNights = calculateHotelNights();
    const costPerNight = parseFloat(tripDetails.hotelCostPerNight) || 0;
    return hotelNights * costPerNight;
  };

  const calculateFullRentalCarDays = () => {
    const tripHours = calculateTripHours();
    const adjustedHours = tripHours - (assumptions.flightLength * 2);
    const fullDays = Math.floor(adjustedHours / 24);
    const remainder = adjustedHours % 24;

    if (remainder > 2.5) {
      return fullDays;
    } else {
      return fullDays + (remainder / 24);
    }
  };

  const calculateRentalCarCost = () => {
    const fullRentalCarDays = calculateFullRentalCarDays();
    const rentalCost = fullRentalCarDays * assumptions.dailyRentalCarCost;
    const totalCost = assumptions.tollCost + assumptions.gasCost + rentalCost;
    return totalCost;
  };

  const calculateAirportParkingCost = () => {
    const tripHours = calculateTripHours();
    const adjustedHours = tripHours + (assumptions.flightLength * 2);
    const fullDays = Math.floor(adjustedHours / 24);
    const remainder = adjustedHours % 24;
    const transportation = tripDetails.airportTransportation;

    if (transportation === "Driving - Economy Lot") {
      return remainder <= (assumptions.flightLength * 2 + 1) 
        ? assumptions.airportParkingEconomyPerDay * (fullDays + 0.5)
        : assumptions.airportParkingEconomyPerDay * (fullDays + 1);
    } else if (transportation === "Driving - Central Lot") {
      return remainder <= (assumptions.flightLength * 2 + 1) 
        ? assumptions.airportParkingCentralPerDay * (fullDays + 0.5)
        : assumptions.airportParkingCentralPerDay * (fullDays + 1);
    } else if (transportation === "Driving - Economy Lot (Advance Reservation)") {
      return remainder <= (assumptions.flightLength * 2 + 1) 
        ? assumptions.airportParkingReservedEconomyPerDay * (fullDays + 0.5)
        : assumptions.airportParkingReservedEconomyPerDay * (fullDays + 1);
    } else {
      return 0;
    }
  };

  const calculateTransportationCost = () => {
    const transportation = tripDetails.airportTransportation;

    if (transportation === "Logan Express") {
      const tripHours = calculateTripHours();
      const parkingDays = Math.ceil((tripHours + (assumptions.flightLength * 2 + 1)) / 24);
      const parkingCost = parkingDays * assumptions.loganExpressParkingPerDay;
      const ticketCost = assumptions.loganExpressRoundTripTicket;
      return parkingCost + ticketCost;
    } else {
      return 0;
    }
  };

  const calculateEstimatedTripCost = () => {
    const breakfastCost = calculateBreakfastCost();
    const lunchCost = calculateLunchCost();
    const dinnerCost = calculateDinnerCost();
    const flightCost = calculateTotalFlightCost();
    const hotelCost = calculateHotelCost();
    const rentalCarCost = calculateRentalCarCost();
    const airportParkingCost = calculateAirportParkingCost();
    const transportationCost = calculateTransportationCost();

    return breakfastCost + lunchCost + dinnerCost + flightCost + hotelCost + rentalCarCost + airportParkingCost + transportationCost;
  };

  const calculateMarginalTaxRate = () => {
    if (!tripDetails.returnDate) return 0;
    
    const month = tripDetails.returnDate.getMonth() + 1; // getMonth() returns 0-11
    const quarter = Math.ceil(month / 3); // This gives us 1-4
    
    const cumulativeIncome = calculateCumulativeIncome(quarter);
    const federalEffectiveTaxRate = calculateEffectiveTaxRate(cumulativeIncome);
    const stateEffectiveTaxRate = 5.0;
    
    return federalEffectiveTaxRate + stateEffectiveTaxRate;
  };

  const calculateEstimatedTaxSavings = () => {
    const estimatedTripCost = calculateEstimatedTripCost();
    const marginalTaxRate = calculateMarginalTaxRate();
    return estimatedTripCost * (marginalTaxRate / 100);
  };

  const calculateEstimatedTripRevenue = () => {
    const numberOfHorses = parseInt(tripDetails.numberOfHorses) || 0;
    const numberOfBarns = parseInt(tripDetails.numberOfBarns) || 0;
    const massageFeeRevenue = numberOfHorses * assumptions.massageFee;
    const travelFeeRevenue = numberOfBarns * assumptions.travelFeePerBarn;
    return massageFeeRevenue + travelFeeRevenue;
  };

  const calculateTripProfit = () => {
    const revenue = calculateEstimatedTripRevenue();
    const savings = calculateEstimatedTaxSavings();
    const cost = calculateEstimatedTripCost();
    return revenue + savings - cost;
  };

  const handleCalculateProfit = () => {
    setCalculatedProfit(calculateTripProfit());
    setShowProfitResult(true);
  };

  const handleResetForm = () => {
    setTripDetails({
      hotelCostPerNight: '',
      flightCost: '',
      checkedBags: '0',
      departureDateDate: null,
      departureTime: '9',
      returnDate: null,
      returnTime: '9',
      airportTransportation: 'Logan Express',
      numberOfHorses: '',
      numberOfBarns: ''
    });
    setShowProfitResult(false);
    setCalculatedProfit(0);
  };

  const generateHours = () => {
    return Array.from({ length: 24 }, (_, i) => i);
  };

  const isReturnDateValid = () => {
    if (!tripDetails.departureDateDate || !tripDetails.returnDate) return true;
    return tripDetails.returnDate >= tripDetails.departureDateDate;
  };

  const formatTime = (hour) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${ampm}`;
  };

  return (
    <TripCostCalculatorStyled>
      <div className="content-wrapper">
        <h2>Trip Cost Calculator</h2>

        {showProfitResult && (
          <div className="profit-result-section">
            <table className="profit-result-table">
              <tbody>
                <tr>
                  <td><strong>Estimated Trip Profit</strong></td>
                  <td className="profit-value"><strong>${calculatedProfit.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="form-container">
          <h3>Enter Trip Details Below:</h3>
          
          <div className="form-content">
            <div className="form-group">
              <label htmlFor="hotelCost">Hotel Cost Per Night:</label>
              <div className="input-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  id="hotelCost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={tripDetails.hotelCostPerNight}
                  onChange={handleInputChange('hotelCostPerNight')}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="flightCost">Flight Cost (including taxes & fees):</label>
              <div className="input-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  id="flightCost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={tripDetails.flightCost}
                  onChange={handleInputChange('flightCost')}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="checkedBags">Number of Checked Bags:</label>
              <select
                id="checkedBags"
                value={tripDetails.checkedBags}
                onChange={handleInputChange('checkedBags')}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="departureDate">Flight Departure Date:</label>
              <DatePicker
                selected={tripDetails.departureDateDate}
                onChange={handleDateChange('departureDateDate')}
                dateFormat="MM/dd/yyyy"
                placeholderText="Select Date"
              />
            </div>

            <div className="form-group">
              <label htmlFor="departureTime">Approximate Flight Departure Time:</label>
              <select
                id="departureTime"
                value={tripDetails.departureTime}
                onChange={handleInputChange('departureTime')}
              >
                {generateHours().map(hour => (
                  <option key={hour} value={hour}>
                    {formatTime(hour)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="returnDate">Flight Return Date:</label>
              <DatePicker
                selected={tripDetails.returnDate}
                onChange={handleDateChange('returnDate')}
                dateFormat="MM/dd/yyyy"
                placeholderText="Select Date"
                minDate={tripDetails.departureDateDate}
              />
              {!isReturnDateValid() && (
                <span className="error-message">Return date must be on or after departure date</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="returnTime">Flight Return Time:</label>
              <select
                id="returnTime"
                value={tripDetails.returnTime}
                onChange={handleInputChange('returnTime')}
              >
                {generateHours().map(hour => (
                  <option key={hour} value={hour}>
                    {formatTime(hour)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="airportTransportation">Airport Transportation:</label>
              <select
                id="airportTransportation"
                value={tripDetails.airportTransportation}
                onChange={handleInputChange('airportTransportation')}
              >
                <option value="Logan Express">Logan Express</option>
                <option value="Driving - Economy Lot">Driving - Economy Lot</option>
                <option value="Driving - Central Lot">Driving - Central Lot</option>
                <option value="Driving - Economy Lot (Advance Reservation)">Driving - Economy Lot (Advance Reservation)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="numberOfHorses">Number of Horses:</label>
              <input
                id="numberOfHorses"
                type="number"
                min="1"
                placeholder="Enter number"
                value={tripDetails.numberOfHorses}
                onChange={handleInputChange('numberOfHorses')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="numberOfBarns">Number of Barns:</label>
              <input
                id="numberOfBarns"
                type="number"
                min="1"
                placeholder="Enter number"
                value={tripDetails.numberOfBarns}
                onChange={handleInputChange('numberOfBarns')}
              />
            </div>
          </div>

          <div className="form-buttons">
            <button 
              className="btn btn-submit-green"
              onClick={handleCalculateProfit}
            >
              {plus}
              Calculate Profit
            </button>
            <button 
              className="btn btn-submit-red"
              onClick={handleResetForm}
            >
              {x}
              Reset Form
            </button>
          </div>
        </div>

        <div className="calculations-section">
          <h3>View Calculations and Adjust Assumptions:</h3>
          <div className="table-buttons">
            <button 
              className={`btn btn-assumptions ${expandedTable === 'assumptions' ? 'active' : ''}`}
              onClick={() => toggleTable('assumptions')}
            >
              Assumptions
            </button>
            <button 
              className={`btn btn-calculated ${expandedTable === 'calculated' ? 'active' : ''}`}
              onClick={() => toggleTable('calculated')}
            >
              Calculated Trip Details
            </button>
            <button 
              className={`btn btn-federal ${expandedTable === 'federal' ? 'active' : ''}`}
              onClick={() => toggleTable('federal')}
            >
              Federal Tax Rates
            </button>
            <button 
              className={`btn btn-quarterly ${expandedTable === 'quarterly' ? 'active' : ''}`}
              onClick={() => toggleTable('quarterly')}
            >
              Quarterly Income
            </button>
          </div>

          {expandedTable === 'assumptions' && (
            <div className="table-section">
              <h3>Assumptions</h3>
              <table>
                <tbody>
                  <tr>
                    <td>Breakfast Meal Cost</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assumptions.breakfastMealCost}
                          onChange={handleAssumptionsChange('breakfastMealCost')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Lunch Meal Cost</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assumptions.lunchMealCost}
                          onChange={handleAssumptionsChange('lunchMealCost')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Dinner Meal Cost</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assumptions.dinnerMealCost}
                          onChange={handleAssumptionsChange('dinnerMealCost')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Daily Rental Car Cost (including fees)</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assumptions.dailyRentalCarCost}
                          onChange={handleAssumptionsChange('dailyRentalCarCost')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Baggage Fee (per flight)</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assumptions.baggageFePerFlight}
                          onChange={handleAssumptionsChange('baggageFePerFlight')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Flight Length (Hours)</td>
                    <td>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={assumptions.flightLength}
                          onChange={handleAssumptionsChange('flightLength')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Toll Cost</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assumptions.tollCost}
                          onChange={handleAssumptionsChange('tollCost')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Gas Cost</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assumptions.gasCost}
                          onChange={handleAssumptionsChange('gasCost')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Logan Express Costs - Parking (per day)</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assumptions.loganExpressParkingPerDay}
                          onChange={handleAssumptionsChange('loganExpressParkingPerDay')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Logan Express Costs - Round Trip Ticket</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assumptions.loganExpressRoundTripTicket}
                          onChange={handleAssumptionsChange('loganExpressRoundTripTicket')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Airport Parking Costs (per day Reserved Economy)</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assumptions.airportParkingReservedEconomyPerDay}
                          onChange={handleAssumptionsChange('airportParkingReservedEconomyPerDay')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Airport Parking Costs (per day Economy)</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assumptions.airportParkingEconomyPerDay}
                          onChange={handleAssumptionsChange('airportParkingEconomyPerDay')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Airport Parking Costs (per day Central)</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assumptions.airportParkingCentralPerDay}
                          onChange={handleAssumptionsChange('airportParkingCentralPerDay')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Massage Fee</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assumptions.massageFee}
                          onChange={handleAssumptionsChange('massageFee')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Travel Fee (per barn)</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={assumptions.travelFeePerBarn}
                          onChange={handleAssumptionsChange('travelFeePerBarn')}
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {expandedTable === 'calculated' && (
            <div className="table-section">
              <h3>Calculated Trip Details</h3>
              <table>
                <tbody>
                  <tr>
                    <td>Number of Hotel Nights</td>
                    <td className="calculated-value">{calculateHotelNights()}</td>
                  </tr>
                  <tr>
                    <td>Trip Hours</td>
                    <td className="calculated-value">{calculateTripHours()}</td>
                  </tr>
                  <tr>
                    <td>Breakfast Cost</td>
                    <td className="calculated-value">${calculateBreakfastCost().toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Lunch Cost</td>
                    <td className="calculated-value">${calculateLunchCost().toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Dinner Cost</td>
                    <td className="calculated-value">${calculateDinnerCost().toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Flight Cost</td>
                    <td className="calculated-value">${calculateTotalFlightCost().toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Hotel Cost</td>
                    <td className="calculated-value">${calculateHotelCost().toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Full Rental Car Days</td>
                    <td className="calculated-value">{calculateFullRentalCarDays().toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Rental Car Cost (incl. Gas & Tolls)</td>
                    <td className="calculated-value">${calculateRentalCarCost().toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Airport Parking Cost (if applicable)</td>
                    <td className="calculated-value">${calculateAirportParkingCost().toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Transportation Cost (if applicable)</td>
                    <td className="calculated-value">${calculateTransportationCost().toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Estimated Trip Cost</td>
                    <td className="calculated-value">${calculateEstimatedTripCost().toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>State Effective Tax Rate</td>
                    <td className="calculated-value">5.00%</td>
                  </tr>
                  <tr>
                    <td>Marginal Tax Rate (for deductions)</td>
                    <td className="calculated-value">{calculateMarginalTaxRate().toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td>Estimated Tax Savings</td>
                    <td className="calculated-value">${calculateEstimatedTaxSavings().toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Estimated Trip Revenue</td>
                    <td className="calculated-value">${calculateEstimatedTripRevenue().toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {expandedTable === 'federal' && (
            <div className="table-section">
              <h3>Federal Tax Rates</h3>
              <table>
                <thead>
                  <tr>
                    <th>Tax Rate</th>
                    <th>On Taxable Income From...</th>
                    <th>Up To...</th>
                  </tr>
                </thead>
                <tbody>
                  {federalTaxRates.map((rate, index) => (
                    <tr key={index}>
                      <td>
                        <div className="input-wrapper">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={rate.taxRate}
                            onChange={handleFederalTaxRateChange(index, 'taxRate')}
                          />
                          <span className="percent-symbol">%</span>
                        </div>
                      </td>
                      <td>
                        <div className="input-wrapper">
                          <span className="currency-symbol">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={rate.fromAmount}
                            onChange={handleFederalTaxRateChange(index, 'fromAmount')}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="input-wrapper">
                          {rate.toAmount === null ? (
                            <input
                              type="text"
                              value="And up"
                              disabled
                              style={{ cursor: 'not-allowed', backgroundColor: '#f0f0f0' }}
                            />
                          ) : (
                            <>
                              <span className="currency-symbol">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={rate.toAmount}
                                onChange={handleFederalTaxRateChange(index, 'toAmount')}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="table-footnote">
                Data source: <a href="https://www.irs.gov/filing/federal-income-tax-rates-and-brackets" target="_blank" rel="noopener noreferrer">IRS Federal Income Tax Rates and Brackets</a>
              </p>
            </div>
          )}

          {expandedTable === 'quarterly' && (
            <div className="table-section">
              <h3>Quarterly Income</h3>
              <table>
                <tbody>
                  <tr>
                    <td>Darrel's Income</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={quarterlyIncome.darrel}
                          onChange={handleQuarterlyIncomeChange('darrel')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Erin's Income</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={quarterlyIncome.erin}
                          onChange={handleQuarterlyIncomeChange('erin')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Bonus</td>
                    <td>
                      <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={quarterlyIncome.bonus}
                          onChange={handleQuarterlyIncomeChange('bonus')}
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="quarterly-analysis">
                <h4>Quarterly Analysis</h4>
                <table className="analysis-table">
                  <thead>
                    <tr>
                      <th>Quarter</th>
                      <th>Cumulative Income</th>
                      <th>Effective Tax Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map((quarter) => {
                      const cumulativeIncome = calculateCumulativeIncome(quarter);
                      const effectiveTaxRate = calculateEffectiveTaxRate(cumulativeIncome);

                      return (
                        <tr key={`q${quarter}`}>
                          <td>Q{quarter}</td>
                          <td>${cumulativeIncome.toLocaleString('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                          <td>{effectiveTaxRate.toFixed(2)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </TripCostCalculatorStyled>
  );
};

const TripCostCalculatorStyled = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0;

  .content-wrapper {
    padding: 2rem 1.5rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  h2 {
    margin-bottom: 1.5rem;
    color: #283595;
  }

  .table-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &.active {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
  }

  .btn-assumptions {
    background: #6c63ff;

    &:hover {
      background: #5a52cc;
    }
  }

  .btn-calculated {
    background: #ff6b6b;

    &:hover {
      background: #ee5a52;
    }
  }

  .btn-federal {
    background: #4ecdc4;

    &:hover {
      background: #45b8af;
    }
  }

  .btn-quarterly {
    background: #ffa502;

    &:hover {
      background: #e8930f;
    }
  }

  .table-section {
    background: rgba(252, 246, 249, 0.78);
    border: 2px solid #FFFFFF;
    backdrop-filter: blur(4.5px);
    border-radius: 32px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
    animation: slideDown 0.3s ease-out;

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    h3 {
      color: #283595;
      margin-bottom: 1.5rem;
      font-size: 1.2rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;

      thead {
        tr {
          border-bottom: 2px solid #283595;
        }

        th {
          padding: 1rem;
          text-align: left;
          color: #283595;
          font-weight: 700;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }

      tbody tr {
        border-bottom: 1px solid #ddd;

        &:last-child {
          border-bottom: none;
        }
      }

      td {
        padding: 1rem;
        text-align: left;
        color: rgba(34, 34, 96, 0.9);
        font-weight: 500;

        &.calculated-value {
          background-color: rgba(40, 53, 147, 0.05);
          font-weight: 600;
          color: #283595;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;

          .currency-symbol {
            position: absolute;
            left: 12px;
            color: #666;
            font-weight: 600;
          }

          .percent-symbol {
            position: absolute;
            right: 12px;
            color: #666;
            font-weight: 600;
          }

          input {
            padding-left: 28px;
            padding: 0.75rem;
            padding-left: 28px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 0.95rem;
            width: 100%;
            font-family: inherit;

            &:focus {
              outline: none;
              border-color: #283595;
              box-shadow: 0 0 0 3px rgba(40, 53, 147, 0.1);
            }

            &:disabled {
              background-color: #f0f0f0;
              cursor: not-allowed;
              color: #666;
            }
          }

          input[type="number"] {
            padding-right: 28px;
          }
        }
      }
    }

    .table-footnote {
      margin-top: 1.5rem;
      font-size: 0.85rem;
      color: rgba(34, 34, 96, 0.7);
      font-style: italic;
      text-align: center;

      a {
        color: #4ecdc4;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.2s ease;

        &:hover {
          color: #45b8af;
          text-decoration: underline;
        }
      }
    }

    .quarterly-analysis {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 2px solid #ddd;

      h4 {
        color: #283595;
        margin-bottom: 1rem;
        font-size: 1.05rem;
      }

      .analysis-table {
        width: 100%;
        border-collapse: collapse;

        thead {
          tr {
            border-bottom: 2px solid #283595;
          }

          th {
            padding: 1rem;
            text-align: left;
            color: #283595;
            font-weight: 700;
            font-size: 0.95rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }

        tbody {
          tr {
            border-bottom: 1px solid #ddd;

            &:last-child {
              border-bottom: none;
            }
          }

          td {
            padding: 1rem;
            text-align: left;
            color: rgba(34, 34, 96, 0.9);
            font-weight: 500;
          }
        }
      }
    }
  }

  .calculations-section {
    background: rgba(252, 246, 249, 0.78);
    border: 2px solid #FFFFFF;
    backdrop-filter: blur(4.5px);
    border-radius: 32px;
    padding: 2rem;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
    margin-top: 3rem;
    margin-bottom: 2rem;

    h3 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: #283595;
    }

    .table-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
  }

  .form-container {
    background: rgba(252, 246, 249, 0.78);
    border: 2px solid #FFFFFF;
    backdrop-filter: blur(4.5px);
    border-radius: 32px;
    padding: 2rem;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
  }

  .form-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    justify-content: flex-start;

    button {
      box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
      &:hover {
        box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.12);
      }
    }
  }

  .btn-submit-green {
    background: var(--color-green);
    color: white;
    padding: 0.8rem 1.6rem;
    border: none;
    border-radius: 30px;
    font-weight: 600;
    cursor: pointer;
    font-size: inherit;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
      background: var(--color-green);
      transform: translateY(-2px);
    }
  }

  .btn-submit-red {
    background: #dc3545;
    color: white;
    padding: 0.8rem 1.6rem;
    border: none;
    border-radius: 30px;
    font-weight: 600;
    cursor: pointer;
    font-size: inherit;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
      background: #c82333 !important;
      transform: translateY(-2px);
    }
  }

  .profit-result-section {
    background: rgba(252, 246, 249, 0.78);
    border: 2px solid #FFFFFF;
    backdrop-filter: blur(4.5px);
    border-radius: 32px;
    padding: 1rem 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
    animation: slideDown 0.3s ease-out;

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  .profit-result-table {
    width: 100%;
    border-collapse: collapse;

    tbody {
      tr {
        border-bottom: 1px solid #ddd;

        &:last-child {
          border-bottom: none;
        }
      }

      td {
        padding: 0.75rem;
        text-align: left;
        color: rgba(34, 34, 96, 0.9);
        font-weight: 600;
        font-size: 1rem;

        &:first-child {
          color: #283595;
        }

        &.profit-value {
          text-align: right;
          color: #1abc9c;
          font-size: 1.1rem;
        }
      }
    }
  }

  .form-container {
    background: rgba(252, 246, 249, 0.78);
    border: 2px solid #FFFFFF;
    backdrop-filter: blur(4.5px);
    border-radius: 32px;
    padding: 2rem;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
  }

  .form-container h3 {
    color: #283595;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
  }

  .form-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
      font-weight: 600;
      color: rgba(34, 34, 96, 0.9);
      font-size: 0.95rem;
    }

    input, select {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: inherit;
      
      &:focus {
        outline: none;
        border-color: #283595;
        box-shadow: 0 0 0 3px rgba(40, 53, 147, 0.1);
      }
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .currency-symbol {
        position: absolute;
        left: 12px;
        color: #666;
        font-weight: 600;
      }

      input {
        padding-left: 28px;
      }
    }

    .error-message {
      color: #dc3545;
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }
  }

  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container {
    width: 100%;
  }

  input[type="date"],
  input[type="text"] {
    width: 100%;
  }

  .react-datepicker__input-container input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;

    &:focus {
      outline: none;
      border-color: #283595;
      box-shadow: 0 0 0 3px rgba(40, 53, 147, 0.1);
    }
  }
`;

export default TripCostCalculator;
